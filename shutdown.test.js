// Tests for shutdown.js (tests 12 to 14). Run every test with: npm test (run npm install once first).
// Each test starts a small server of its own at a free port the computer picks (port 0), and hands shutdown a
// stand-in database client that notes when it's closed, and a logger that collects its lines.
// You don't need to change this file.
import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { shutdown } from "./shutdown.js";
import { createLogger } from "./logger.js";

// Every server a test starts, so the tests can stop any that shutdown left running.
const servers = [];

afterEach(() => {
  for (const server of servers.splice(0)) {
    server.closeAllConnections();
    server.close(() => {});
  }
});

// A small server whose one route answers "on time" after 300 milliseconds, like a slow lookup. It counts the answers
// it has finished sending in server.answersSent.
async function startSlowServer() {
  const server = http.createServer((req, res) => {
    setTimeout(() => {
      res.end("on time");
      server.answersSent += 1;
    }, 300);
  });
  server.answersSent = 0;
  servers.push(server);
  await new Promise((resolve) => server.listen(0, resolve));
  return server;
}

// A stand-in for the MongoDB client: it notes that close() ran, whether the server was still listening then, and how
// many answers the server had finished sending by then.
function standInClient(server) {
  return {
    closed: false,
    serverListeningWhenClosed: undefined,
    answersSentWhenClosed: undefined,
    async close() {
      this.closed = true;
      this.serverListeningWhenClosed = server.listening;
      this.answersSentWhenClosed = server.answersSent;
    },
  };
}

// Sends GET /routes to the server at that port, and gives back "<status> <body>", or "no answer: <why>".
// agent: false sends the request on a connection of its own, which closes when the answer is complete.
function getRoutes(port) {
  return new Promise((resolve) => {
    http.get({ port, path: "/routes", agent: false }, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => resolve(`${res.statusCode} ${body}`));
    }).on("error", (error) => resolve(`no answer: ${error.message}`));
  });
}

function collectLines() {
  const lines = [];
  return { lines, logger: createLogger("info", { write: (line) => lines.push(JSON.parse(line)) }) };
}

test("12) shutdown closes the server, then the database client, before it resolves", async () => {
  const server = await startSlowServer();
  const client = standInClient(server);
  const { logger } = collectLines();
  await shutdown({ server, client, logger, signal: "SIGTERM" });
  assert.equal(server.listening, false, "The server should have stopped listening (server.close).");
  assert.equal(client.closed, true, "The database client should be closed (client.close) before shutdown resolves.");
  assert.equal(client.serverListeningWhenClosed, false, "Close the server first, and the database client after it.");
});

test("13) A request in progress when shutdown starts gets its answer, 200 \"on time\", before the database client closes", async () => {
  const server = await startSlowServer();
  const client = standInClient(server);
  const { logger } = collectLines();
  const { port } = server.address();
  const answer = getRoutes(port);
  await new Promise((resolve) => setTimeout(resolve, 100)); // the request is on its way, and the answer isn't ready
  await shutdown({ server, client, logger, signal: "SIGTERM" });
  assert.equal(await answer, "200 on time", "The request was in progress, so it should still get its answer.");
  assert.equal(client.answersSentWhenClosed, 1,
    "The database client was closed while a request was still being answered. Wait until server.close has finished " +
    "(its callback runs when every request in progress has its answer), then close the client.");
});

test("14) shutdown logs { signal } with \"Shutting down: finishing the requests in progress\", then \"Closed the server and the database connection\"", async () => {
  const server = await startSlowServer();
  const client = standInClient(server);
  const { lines, logger } = collectLines();
  await shutdown({ server, client, logger, signal: "SIGINT" });
  assert.deepEqual(lines.map((line) => line.msg),
    ["Shutting down: finishing the requests in progress", "Closed the server and the database connection"]);
  assert.equal(lines[0].signal, "SIGINT", "The first line should hold the signal: { signal }.");
  assert.equal(lines[0].level, 30, "Both lines are info lines (level 30).");
  assert.equal(lines[1].level, 30, "Both lines are info lines (level 30).");
});

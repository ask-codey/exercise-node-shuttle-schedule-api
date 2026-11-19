// Tests for logger.js (tests 7 to 9). Run every test with: npm test (run npm install once first).
// Each test makes a logger whose destination collects its lines in a list instead of writing them to the terminal,
// then reads those lines. No server needs to be running, and no port is used. You don't need to change this file.
import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";
import { createLogger, createRequestLogger } from "./logger.js";

// A destination that keeps every line pino writes, each turned back into an object.
function collectLines() {
  const lines = [];
  return { lines, destination: { write: (line) => lines.push(JSON.parse(line)) } };
}

test("7) createLogger(\"warn\") writes the warn and error lines and leaves out the info line", () => {
  const { lines, destination } = collectLines();
  const logger = createLogger("warn", destination);
  logger.info("The Blue Loop is running");
  logger.warn("The Night Owl is late");
  logger.error("The Gold Line has no buses");
  assert.deepEqual(lines.map((line) => line.msg), ["The Night Owl is late", "The Gold Line has no buses"],
    "At level warn, only warn and error lines (and fatal) should be written.");
});

test("8) createLogger(\"info\") writes config.mongodbUri as \"[Redacted]\" and keeps config.port", () => {
  const { lines, destination } = collectLines();
  const logger = createLogger("info", destination);
  const config = { port: 3100, mongodbUri: "mongodb+srv://shuttle:<password>@cluster0.example.mongodb.net/campus_shuttle", logLevel: "info" };
  logger.info({ config }, "Settings loaded");
  assert.equal(lines.length, 1, `There should be one line, but there were ${lines.length}.`);
  assert.equal(lines[0].config?.mongodbUri, "[Redacted]",
    `config.mongodbUri should be written as "[Redacted]", but it was ${JSON.stringify(lines[0].config?.mongodbUri)}.`);
  assert.equal(lines[0].config?.port, 3100, "config.port isn't a secret, so it should still be written: 3100.");
});

test("9) createRequestLogger logs GET /routes with status 200, and its Authorization and Cookie headers as \"[Redacted]\"", async () => {
  const { lines, destination } = collectLines();
  const testApp = express();
  testApp.use(createRequestLogger(createLogger("info", destination)));
  testApp.get("/routes", (req, res) => res.json([]));

  await request(testApp).get("/routes")
    .set("Authorization", "Bearer example-token-not-a-real-one")
    .set("Cookie", "session=example-cookie");

  const line = lines.find((l) => l.req?.url === "/routes");
  assert.ok(line, "There should be a log line for GET /routes, with the request in it. Is the middleware pino-http?");
  assert.equal(line.req.method, "GET");
  assert.equal(line.res?.statusCode, 200, "The line should hold the answer's status code, 200.");
  assert.equal(line.req.headers.authorization, "[Redacted]",
    `The Authorization header should be written as "[Redacted]", but it was "${line.req.headers.authorization}".`);
  assert.equal(line.req.headers.cookie, "[Redacted]",
    `The Cookie header should be written as "[Redacted]", but it was "${line.req.headers.cookie}".`);
});

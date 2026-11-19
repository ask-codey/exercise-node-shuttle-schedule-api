// Tests for app.js (tests 10 and 11). Run every test with: npm test (run npm install once first).
// Each test builds your app with createApp(db), sends it a request with Supertest and checks the answer. No server needs to be running, and no
// port is used. The routes live in a throwaway MongoDB (throwaway-database.js), so your own databases are never
// touched. You don't need to change this file.
import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "./app.js";
import { logger } from "./logger.js";
import { startThrowawayDatabase } from "./throwaway-database.js";

// The app's request logs would fill the test output, so the tests turn them off.
logger.level = "silent";

const database = startThrowawayDatabase();

// Checks the parts every answer shares: its status code and its Content-Type header.
function assertJson(response, status, what) {
  assert.equal(response.status, status,
    `${what} should answer ${status}, but it answered ${response.status} with ${JSON.stringify(response.body)}.`);
  assert.match(response.headers["content-type"] ?? "(none)", /application\/json/, `${what} should answer with JSON.`);
}

test("10) GET /health answers 200 with { \"status\": \"ok\" } when the database answers its ping", async () => {
  const response = await request(createApp(database.db())).get("/health");
  assertJson(response, 200, "GET /health");
  assert.deepEqual(response.body, { status: "ok" });
});

test("11) GET /health answers 503 with { \"status\": \"unavailable\" } when the database doesn't answer", async () => {
  // A stand-in database whose ping always fails, as if MongoDB had stopped.
  const stoppedDatabase = { command: async () => { throw new Error("connect ECONNREFUSED 127.0.0.1:27017"); } };
  const response = await request(createApp(stoppedDatabase)).get("/health");
  if (response.status === 500) {
    assert.fail("GET /health answered 500: the route threw. Is the request logger used before the routes, so " +
      "req.log is there for the warning?");
  }
  assertJson(response, 503, "GET /health with a database that doesn't answer");
  assert.deepEqual(response.body, { status: "unavailable" });
});

// Tests for config.js (tests 1 to 6). Run every test with: npm test (run npm install once first).
// Each test hands loadConfig a plain object standing in for process.env, and checks what it gives back or the
// message of the error it throws. You don't need to change this file.
import { test } from "node:test";
import assert from "node:assert/strict";
import { loadConfig } from "./config.js";

const localUri = "mongodb://localhost:27017/campus_shuttle";
const start = "Fix these settings, then start again: ";

// Runs loadConfig(env) and gives back the message of the error it throws, or a sentence saying it threw nothing.
function messageFrom(env) {
  try {
    const config = loadConfig(env);
    return `(nothing was thrown: loadConfig gave back ${JSON.stringify(config)})`;
  } catch (error) {
    return error.message;
  }
}

test("1) Only MONGODB_URI set gives { port: 3100, mongodbUri, logLevel: \"info\" }", () => {
  assert.deepEqual(loadConfig({ MONGODB_URI: localUri }), { port: 3100, mongodbUri: localUri, logLevel: "info" },
    "PORT and LOG_LEVEL aren't set, so they should be their defaults, 3100 and \"info\".");
});

test("2) PORT \"3200\", a mongodb+srv:// address and LOG_LEVEL \"debug\" give port 3200 as a number", () => {
  const atlasUri = "mongodb+srv://cluster0.example.mongodb.net/campus_shuttle";
  assert.deepEqual(loadConfig({ PORT: "3200", MONGODB_URI: atlasUri, LOG_LEVEL: "debug" }),
    { port: 3200, mongodbUri: atlasUri, logLevel: "debug" },
    "Every environment variable is text: PORT \"3200\" should come back as the number 3200.");
});

test("3) An empty environment throws \"Fix these settings, then start again: MONGODB_URI is missing.\"", () => {
  assert.equal(messageFrom({}), `${start}MONGODB_URI is missing.`);
});

test("4) MONGODB_URI \"localhost:27017\" throws \"...: MONGODB_URI must start with mongodb:// or mongodb+srv://.\"", () => {
  assert.equal(messageFrom({ MONGODB_URI: "localhost:27017" }),
    `${start}MONGODB_URI must start with mongodb:// or mongodb+srv://.`);
});

test("5) PORT \"31OO\", \"0\", \"3100.5\" and \"70000\" each throw \"...: PORT must be a whole number from 1 to 65535.\"", () => {
  for (const port of ["31OO", "0", "3100.5", "70000"]) {
    assert.equal(messageFrom({ PORT: port, MONGODB_URI: localUri }),
      `${start}PORT must be a whole number from 1 to 65535.`, `PORT "${port}" should be refused.`);
  }
});

test("6) PORT \"abc\", no MONGODB_URI and LOG_LEVEL \"loud\" throw one message naming all three, in that order", () => {
  assert.equal(messageFrom({ PORT: "abc", LOG_LEVEL: "loud" }),
    `${start}PORT must be a whole number from 1 to 65535; MONGODB_URI is missing; ` +
      "LOG_LEVEL must be fatal, error, warn, info, debug, trace or silent.");
});

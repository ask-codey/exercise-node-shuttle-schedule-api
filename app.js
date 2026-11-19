// The Campus Shuttle API. Its routes work: for you to get ready for real riders.
//
// createApp(db) builds the app around the database it's given: server.js gives it your MongoDB, and the tests give
// it a throwaway one (or a stand-in that never answers). shuttle, the repository it makes from db, does the
// database work. The routes already work:
//   GET /routes          200, every route, sorted by id
//   GET /routes/:id      200, one route, such as /routes/blue-loop
//                        404, { "status": 404, "title": "Not Found", "detail": "There's no route purple-line." }
//                        for an id with no route
//
// Get it ready for real riders:
//   1. Log every request: use createRequestLogger(logger), from logger.js, before the routes, so every request gets
//      a log line and every route has req.log.
//   2. GET /health asks the database to answer a ping, with shuttle.pingDatabase():
//        200, { "status": "ok" }            the database answered
//        503, { "status": "unavailable" }   the ping failed (shuttle.pingDatabase() rejected). Also log a warning first:
//                                           req.log.warn({ err: error }, "Health check: the database didn't answer")
//
// For now, there's no request logger and no /health route.
import express from "express";
import { STATUS_CODES } from "node:http";
import { logger, createRequestLogger } from "./logger.js";
import { createShuttleRepository } from "./shuttle.js";

// Every error answer has the course's one shape: { status, title, detail }.
function sendProblem(res, status, detail) {
  res.status(status).json({ status, title: STATUS_CODES[status], detail });
}

export function createApp(db) {
  const shuttle = createShuttleRepository(db);
  const app = express();

  app.get("/routes", async (req, res) => {
    res.json(await shuttle.listRoutes());
  });

  app.get("/routes/:id", async (req, res) => {
    const route = await shuttle.findRoute(req.params.id);
    if (route === null) {
      sendProblem(res, 404, `There's no route ${req.params.id}.`);
      return;
    }
    res.json(route);
  });

  return app;
}

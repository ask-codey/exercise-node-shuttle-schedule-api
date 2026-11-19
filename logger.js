// The shuttle API's logs. For you to finish.
//
//   createLogger(level, destination)   gives back a pino logger at that level, such as "info" or "warn". It writes one
//                                      JSON line per log to destination (the terminal when destination is left out),
//                                      and it never writes these three values; each shows as "[Redacted]" instead:
//                                        req.headers.authorization   a rider's token
//                                        req.headers.cookie          a rider's cookie
//                                        config.mongodbUri           the database's address, which can hold a password
//   createRequestLogger(logger)        gives back pino-http middleware that logs one line for every request, with
//                                      that logger
//
// For now, createLogger ignores the level and redacts nothing, and createRequestLogger logs nothing.
import pino from "pino";
import { pinoHttp } from "pino-http";

export function createLogger(level, destination) {
  return pino(destination);
}

export function createRequestLogger(logger) {
  return (req, res, next) => next();
}

// The logger the API uses. server.js sets its level from LOG_LEVEL when the server starts. Ready to use.
export const logger = createLogger("info");

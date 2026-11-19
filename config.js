// The shuttle API's settings, checked when the server starts. For you to finish.
//
// loadConfig(env) reads three settings from env (process.env when the server starts; a plain object in the tests)
// and gives back { port, mongodbUri, logLevel }:
//
//   PORT          optional, 3100 when it isn't set; a whole number from 1 to 65535, given back as a number
//                 its problem: "PORT must be a whole number from 1 to 65535"
//   MONGODB_URI   required; it starts with mongodb:// or mongodb+srv://
//                 its problems: "MONGODB_URI is missing" (not set at all)
//                               "MONGODB_URI must start with mongodb:// or mongodb+srv://" (set to anything else)
//   LOG_LEVEL     optional, "info" when it isn't set; one of fatal, error, warn, info, debug, trace or silent
//                 its problem: "LOG_LEVEL must be fatal, error, warn, info, debug, trace or silent"
//
// When any setting has a problem, loadConfig throws one Error whose message names every problem, in the order above,
// joined by "; ", after "Fix these settings, then start again: " and ending with a period:
//   "Fix these settings, then start again: PORT must be a whole number from 1 to 65535; MONGODB_URI is missing."
//
// For now, loadConfig throws an error that says it isn't built yet.
import { z } from "zod";

export function loadConfig(env) {
  throw new Error("Not built yet.");
}

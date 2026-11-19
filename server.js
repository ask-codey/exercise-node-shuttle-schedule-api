// Starts the Campus Shuttle API at http://localhost:3100, with the routes in app.js and the shuttle's routes in MongoDB.
// Run it with: npm start (or npm run dev, which restarts it each time you save and shows the logs with pino-pretty).
// It reads PORT, MONGODB_URI and LOG_LEVEL from .env, so copy .env.example to .env first, and MongoDB must be running.
// Stop it with Ctrl+C, which shuts it down gracefully. Ready to use: you don't need to change this file.
import { MongoClient } from "mongodb";
import { loadConfig } from "./config.js";
import { logger } from "./logger.js";
import { createApp } from "./app.js";
import { addSampleRoutes } from "./shuttle.js";
import { shutdown } from "./shutdown.js";

let config;
try {
  config = loadConfig(process.env);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

logger.level = config.logLevel;
logger.info({ config }, "Settings loaded");

// serverSelectionTimeoutMS: when MongoDB doesn't answer, give up after 3 seconds instead of 30, so /health's 503
// comes back before a host gives up on it.
const client = new MongoClient(config.mongodbUri, { serverSelectionTimeoutMS: 3000 });
await client.connect();
const db = client.db();
await addSampleRoutes(db);
const app = createApp(db);

const server = app.listen(config.port, () => {
  logger.info(`The Campus Shuttle API is listening on http://localhost:${config.port}`);
});

async function stop(signal) {
  // If a request is still running after 10 seconds, stop anyway: a host won't wait forever.
  setTimeout(() => {
    logger.error("Still busy after 10 seconds, so stopping anyway");
    process.exit(1);
  }, 10_000).unref();
  await shutdown({ server, client, logger, signal });
}

process.once("SIGTERM", stop);
process.once("SIGINT", stop);

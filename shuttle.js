// The shuttle's routes, kept in MongoDB's routes collection. Ready to use: you don't need to change this file.
import { sampleRoutes } from "./sample-routes.js";

// Saves the three sample routes in db, unless its routes collection already holds some. server.js and the tests
// (throwaway-database.js) call it once, before the first request.
export async function addSampleRoutes(db) {
  const routes = db.collection("routes");
  if ((await routes.countDocuments()) === 0) {
    await routes.insertMany(structuredClone(sampleRoutes));
  }
}

// createShuttleRepository(db) gives back three functions for the database it's given. app.js's createApp(db) makes
// one, so every route uses the database server.js (or a test) handed it.
export function createShuttleRepository(db) {
  return {
    // Every route, sorted by id, without MongoDB's _id.
    listRoutes() {
      return db.collection("routes").find({}, { projection: { _id: 0 } }).sort({ id: 1 }).toArray();
    },

    // One route by its id, such as "blue-loop", or null when there's no such route.
    findRoute(id) {
      return db.collection("routes").findOne({ id }, { projection: { _id: 0 } });
    },

    // Asks the database to answer a ping. It resolves when the database answers, and rejects when it can't be reached.
    async pingDatabase() {
      await db.command({ ping: 1 });
    },
  };
}

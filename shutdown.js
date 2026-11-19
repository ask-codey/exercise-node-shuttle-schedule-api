// Shutting the API down gracefully. For you to finish.
//
// server.js calls shutdown({ server, client, logger, signal }) when the server gets SIGTERM (from a host) or SIGINT
// (Ctrl+C). In this order, it:
//   1. logs, at info, { signal } with the message "Shutting down: finishing the requests in progress"
//   2. stops the server taking new requests, and waits until every request already in progress has had its answer
//      (server.close)
//   3. then closes the database client (client.close)
//   4. logs, at info, the message "Closed the server and the database connection"
// It gives back a promise that resolves when all four are done.
//
// For now, shutdown throws an error that says it isn't built yet.
export async function shutdown({ server, client, logger, signal }) {
  throw new Error("Not built yet.");
}

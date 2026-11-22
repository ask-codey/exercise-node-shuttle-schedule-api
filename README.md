# Exercise: Shuttle Schedule API

Exercise code for the lesson **Exercise: Shuttle Schedule API** in the Node.js in Depth course on [ask-codey.com](https://www.ask-codey.com).

The campus shuttle's API already answers riders: every route, and one route by its id. Before it goes live for real riders, it needs four things a team would ask for: settings checked when the server starts, a log line for every request with secrets hidden, a health check a host can call, and a shutdown that never cuts off a rider's request. You'll build all four, and tests check each one.

## What's here

- `config.js`: `loadConfig(env)`, which checks `PORT`, `MONGODB_URI` and `LOG_LEVEL` with Zod. For you to finish.
- `logger.js`: `createLogger(level, destination)` and `createRequestLogger(logger)`, with pino and pino-http. For you to finish.
- `app.js`: `createApp(db)`, which builds the API around the database it's given. `GET /routes` and `GET /routes/:id` work; you add the request logger and `GET /health`. For you to finish.
- `shutdown.js`: `shutdown({ server, client, logger, signal })`, which closes the server, then the database. For you to finish.
- `server.js`: loads the settings, connects to MongoDB, starts the server at the port from `PORT`, and calls `shutdown` on Ctrl+C or SIGTERM. Ready to use.
- `shuttle.js` and `sample-routes.js`: the shuttle's three routes, kept in MongoDB, and `createShuttleRepository(db)`, with `listRoutes`, `findRoute` and `pingDatabase`. Ready to use.
- `shuttle.insomnia.json`: the requests to try, as an Insomnia collection. Ready to use.
- `.env.example`: the three settings, with values for your own computer. Copy it to `.env`. Ready to use.
- `config.test.js`, `logger.test.js`, `app.test.js` and `shutdown.test.js`: the tests, 14 in all, and `throwaway-database.js`, the throwaway MongoDB they use. You don't need to change them.
- `package.json` and `package-lock.json`: the project's settings, its scripts (`start`, `dev` and `test`) and its packages at exact versions. Ready to use.

## Before you start

In VS Code's terminal, in this folder, install the packages:

```bash
npm install
```

Then copy `.env.example` to `.env` (in VS Code: right-click it, **Copy**, then **Paste**, and rename the copy). `.env` is in `.gitignore`, so it never reaches GitHub.

## Run it

MongoDB must be running on your computer, as in the course's MongoDB setup lesson.

```bash
npm run dev
```

`npm run dev` restarts the server each time you save, and pipes its logs through pino-pretty, which shows each one in color, a field per line. `npm start` runs it the way a host would, with one JSON line per log. In Insomnia, click **Import** in your `Node.js in Depth` project, choose `shuttle.insomnia.json`, and send any request; watch the server's terminal as each one is logged. Stop the server with **Ctrl+C**: once `shutdown.js` is done, its last log line says the server and the database connection are closed.

Until `config.js` is finished, the server stops at once with `Not built yet.` That's expected.

## Check your work

```bash
npm test
```

No server and no MongoDB need to be running: the tests hand requests straight to the app `createApp(db)` builds, and use a throwaway MongoDB of their own. At first every test fails: that is expected. Each job you finish turns its tests green. A failing test's message says what it expected and what it got.

The first run may take a minute: if MongoDB isn't installed on this computer, the tests download a copy once, into a cache folder.

## The rules

- Check the settings with Zod in `loadConfig`, and give back the numbers and text the comment at the top of `config.js` lists.
- Log with pino and pino-http, never `console.log`, and never write a token, a cookie or the database's address to a log.
- Keep the `listen` call in `server.js`: the tests import `createApp` and build the app without starting a server.
- Don't change the test files, `throwaway-database.js`, `shuttle.js` or `sample-routes.js`: the tests rely on them.

## Tips

- `z.coerce.number()` turns `PORT`'s text into a number before it's checked, and `.default(3100)` fills it in when it isn't set.
- Zod's `safeParse` never throws: it gives back `{ success, data }` or `{ success, error }`, and `error.issues` holds every problem, each with its `message`.
- pino's `redact` option takes a list of paths, such as `"req.headers.authorization"`, and writes `[Redacted]` there.
- `server.close` takes a function it calls once every request in progress has its answer. Wrap it in a `Promise` to `await` it.
- Run one test file at a time while you work on its job, such as `node --test config.test.js`.

## Hand it in

When it works, push your solution to a public repo of your own on GitHub, then paste that repo's address into **Submit your exercise** on the lesson page at [ask-codey.com](https://www.ask-codey.com). That's what completes the lesson. The lesson page shows the Git commands, step by step.

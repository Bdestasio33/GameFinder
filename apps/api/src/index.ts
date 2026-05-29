import { createApp, shutdown } from "./app.js";
import { getApiPort } from "./env.js";

const { app } = createApp();
const port = getApiPort();

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`GameFinder API listening on http://localhost:${port}`);
});

async function handleShutdown() {
  await shutdown(server);
  process.exit(0);
}

process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);

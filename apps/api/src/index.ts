import { closeDb, createDb, isDatabaseConnected } from "@gamefinder/db";
import { healthResponseSchema } from "@gamefinder/shared";
import cors from "cors";
import express from "express";
import { getApiPort, getDatabaseUrl } from "./env.js";

const app = express();
const db = createDb(getDatabaseUrl());

app.use(cors());
app.use(express.json());

app.get("/health", async (_request, response) => {
  const database = (await isDatabaseConnected(db))
    ? "connected"
    : "disconnected";

  const payload = healthResponseSchema.parse({
    status: "ok",
    service: "gamefinder-api",
    database,
  });

  response.json(payload);
});

app.get("/api/games", async (_request, response) => {
  const rows = await db.query.games.findMany({
    with: {
      tags: {
        with: {
          tag: true,
        },
      },
    },
    orderBy: (gamesTable, { asc }) => [asc(gamesTable.title)],
  });

  response.json(
    rows.map((game) => ({
      id: game.id,
      title: game.title,
      description: game.description,
      minPlayers: game.minPlayers,
      maxPlayers: game.maxPlayers,
      minPlayTimeMinutes: game.minPlayTimeMinutes,
      maxPlayTimeMinutes: game.maxPlayTimeMinutes,
      publisher: game.publisher,
      publishedYear: game.publishedYear,
      tags: game.tags.map(({ tag }) => ({
        slug: tag.slug,
        name: tag.name,
        kind: tag.kind,
      })),
    })),
  );
});

const port = getApiPort();

const server = app.listen(port, () => {
  console.log(`GameFinder API listening on http://localhost:${port}`);
});

async function shutdown() {
  server.close();
  await closeDb();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

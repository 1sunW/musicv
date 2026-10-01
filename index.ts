import Fastify from "fastify";
import cors from "@fastify/cors";
import staticPlugin from "@fastify/static";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

// Automatically load variables from .env and .env.example
function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return;
  try {
    const content = readFileSync(filePath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (key && !(key in process.env) && val) {
        process.env[key] = val;
      }
    }
  } catch {}
}

loadEnvFile(path.join(process.cwd(), ".env"));
loadEnvFile(path.join(process.cwd(), ".env.example"));

import { musicRoutes } from "./routes/music.js";
import { youtubeRoutes } from "./routes/youtube.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fastify = Fastify({ logger: { level: "info" } });

// Start the auxiliary SoundCloud backend if present
try {
  const scScript = path.join(__dirname, "services", "soundcloud-backend", "server.js");
  if (existsSync(scScript)) {
    const scProc = spawn(process.execPath, [scScript], {
      env: { ...process.env, PORT: "8081", SC_HOST: "127.0.0.1" },
      stdio: "ignore",
    });
    scProc.unref();
    process.on("exit", () => {
      try { scProc.kill(); } catch {}
    });
  }
} catch (e) {
  console.warn("Could not start background SoundCloud service:", e);
}

async function startServer() {
  await fastify.register(cors, { origin: true });
  await fastify.register(staticPlugin, {
    root: existsSync(path.join(__dirname, "public"))
      ? path.join(__dirname, "public")
      : path.join(__dirname, "..", "public"),
  });
  fastify.register(musicRoutes);
  fastify.register(youtubeRoutes);

  fastify.setNotFoundHandler((req, res) => {
    res
      .code(404)
      .send({
        error: `${req.url} was not found on this server. Check the spelling and try again.`,
      });
  });

  try {
    // Render provides PORT at runtime. Keep MUSIC_PORT as a local-development
    // override, then fall back to the original default.
    const usePort =
      Number(process.env.PORT) || Number(process.env.MUSIC_PORT) || 3000;
    await fastify.listen({ port: usePort, host: "0.0.0.0" });
    console.log("Sonora spinning safely on http://localhost:" + usePort);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

startServer();

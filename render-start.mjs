import { spawn } from "node:child_process";

const sharedEnv = { ...process.env };

// The SoundCloud fallback is part of this repository, but it is a separate
// Express process. Start it on loopback so the public Render service exposes
// only the Fastify app.
const soundcloud = spawn(
  process.execPath,
  ["services/soundcloud-backend/server.js"],
  {
    env: {
      ...sharedEnv,
      PORT: "8081",
      SC_HOST: "127.0.0.1",
    },
    stdio: "inherit",
  },
);

const app = spawn(process.execPath, ["dist/index.js"], {
  env: sharedEnv,
  stdio: "inherit",
});

let stopping = false;
function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  soundcloud.kill("SIGTERM");
  app.kill("SIGTERM");
  setTimeout(() => process.exit(exitCode), 500);
}

process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));

app.on("exit", (code, signal) => {
  if (!stopping) {
    soundcloud.kill("SIGTERM");
    process.exit(code ?? (signal ? 1 : 0));
  }
});

soundcloud.on("error", (error) => {
  console.error("SoundCloud backend failed to start:", error);
});
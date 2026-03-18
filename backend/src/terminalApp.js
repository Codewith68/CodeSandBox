import http from "http";
import { WebSocketServer } from "ws";
import express from "express";
import { handleTerminalCreation } from "./containers/handleTerminalCreation.js";
import { handleContainerCreate } from "./containers/handleContainerCreate.js";

const app = express();
const server = http.createServer(app);

const terminalWSS = new WebSocketServer({
  server,
  path: "/terminal", // 🔥 REQUIRED
});

terminalWSS.on("connection", async (ws, req) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const projectId = url.searchParams.get("projectId");

    if (!projectId) {
      ws.close();
      return;
    }

    const container = await handleContainerCreate(projectId);

    if (!container) {
      ws.close();
      return;
    }

    handleTerminalCreation(container, ws);
  } catch (err) {
    console.error("WS terminal error:", err);
    ws.close();
  }
});

server.listen(4000, () => {
  console.log("✅ Backend running on http://localhost:4000");
});

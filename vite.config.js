import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";

const DB_DIR = path.resolve(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Lightweight local database API middleware — saves directly to ./data/db.json
function localDatabasePlugin() {
  return {
    name: "local-file-db-middleware",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url.startsWith("/api/db")) {
          return next();
        }

        const readDb = () => {
          try {
            if (!fs.existsSync(DB_DIR)) {
              fs.mkdirSync(DB_DIR, { recursive: true });
            }
            if (fs.existsSync(DB_FILE)) {
              return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
            }
          } catch (err) {
            console.error("[LocalDB] Read error:", err);
          }
          return {};
        };

        const writeDb = (data) => {
          try {
            if (!fs.existsSync(DB_DIR)) {
              fs.mkdirSync(DB_DIR, { recursive: true });
            }
            fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
          } catch (err) {
            console.error("[LocalDB] Write error:", err);
          }
        };

        // GET /api/db -> returns whole database
        if (req.method === "GET" && req.url === "/api/db") {
          res.setHeader("Content-Type", "application/json");
          return res.end(JSON.stringify(readDb()));
        }

        // POST /api/db or POST /api/db/:collection -> updates database file
        if (req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => (body += chunk));
          req.on("end", () => {
            try {
              const payload = JSON.parse(body || "{}");
              const currentDb = readDb();
              const urlParts = req.url.split("?")[0].split("/");
              const collection = urlParts[3];

              if (collection) {
                currentDb[collection] = payload;
              } else if (payload && typeof payload === "object") {
                Object.assign(currentDb, payload);
              }

              writeDb(currentDb);
              res.setHeader("Content-Type", "application/json");
              return res.end(JSON.stringify({ success: true, updated: collection || "all" }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              return res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localDatabasePlugin()],
  server: {
    port: 5173,
    open: false,
  },
});

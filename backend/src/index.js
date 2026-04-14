const fs = require("fs");
const express = require("express");
const cors = require("cors");
const path = require("path");

function loadLocalEnvFile() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    if (!key || process.env[key] !== undefined) continue;

    let value = line.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadLocalEnvFile();

const apiRoutes = require("./routes/api");
const authRoutes = require("./routes/auth");
const { attachAuthUser } = require("./middleware/auth");
const { ensureAvatarDirectory } = require("./services/avatarService");

const app = express();
const PORT = process.env.PORT || 3001;
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);
const vercelPreviewOriginPattern = /^https:\/\/[a-z0-9-]+(?:-[a-z0-9-]+)*\.vercel\.app$/i;
const privateNetworkOriginPattern =
  /^https?:\/\/(localhost|127\.0\.0\.1|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(:\d+)?$/;

// Middleware
app.use(cors({
  origin(origin, callback) {
    // Allow browser refreshes, direct API access, configured frontend URLs, and LAN hosts.
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      vercelPreviewOriginPattern.test(origin) ||
      privateNetworkOriginPattern.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(new Error("CORS blocked for origin: " + origin));
  },
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "3mb" }));
app.use(attachAuthUser);
ensureAvatarDirectory();
app.use("/uploads/avatars", express.static(path.join(process.cwd(), "storage", "avatars")));

// Routes
app.use("/api", apiRoutes);
app.use("/api/auth", authRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "NutriCalc API", version: "1.0.0" });
});

app.listen(PORT, () => {
  console.log(`NutriCalc API running on port ${PORT}`);
});

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

const { apiRateLimit } = require("./middleware/rateLimit");
const apiRoutes = require("./routes/index");
const { env } = require("./config/env");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// Apply rate-limiting to all API calls.
app.use("/api", apiRateLimit(), apiRoutes);

app.get("/healthz", (req, res) => res.json({ ok: true }));

// Central error handler (avoid leaking internals)
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  const status = err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(status).json({ message });
});

module.exports = { app };


const { app } = require("./app");
const { connectMongo } = require("./config/database");
const { env } = require("./config/env");

async function main() {
  await connectMongo();
  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start backend:", err);
  process.exit(1);
});


const mongoose = require("mongoose");
const { env } = require("./env");

async function connectMongo() {
  mongoose.set("strictQuery", true);

  // Ensure we don't accidentally keep hanging connections
  await mongoose.connect(env.MONGODB_URI, {
    autoIndex: true,
  });
}

module.exports = { connectMongo };


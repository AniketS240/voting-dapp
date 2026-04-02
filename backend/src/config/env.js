const required = (value, name) => {
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
};

require("dotenv").config();

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 5000),

  MONGODB_URI: required(process.env.MONGODB_URI, "MONGODB_URI"),

  RPC_URL: required(process.env.RPC_URL, "RPC_URL"),
  CONTRACT_ADDRESS: required(process.env.CONTRACT_ADDRESS, "CONTRACT_ADDRESS"),

  ADMIN_PRIVATE_KEY: required(process.env.ADMIN_PRIVATE_KEY, "ADMIN_PRIVATE_KEY"),
  ADMIN_API_KEY: required(process.env.ADMIN_API_KEY, "ADMIN_API_KEY"),

  EXPECTED_CHAIN_ID: process.env.EXPECTED_CHAIN_ID ? Number(process.env.EXPECTED_CHAIN_ID) : undefined,
};

module.exports = { env };


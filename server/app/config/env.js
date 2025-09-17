require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 4000,
  JWT_SECRET: process.env.JWT_SECRET,
  REDIS_URL: process.env.REDIS_URL,
  DATABASE_URL: process.env.DATABASE_URL,
};

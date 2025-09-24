const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const connectToDatabase = async () => {
  try {
    await pool.connect();
    console.log("Connected to the database successfully.");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

module.exports = {connectToDatabase };

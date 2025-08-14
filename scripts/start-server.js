#!/usr/bin/env node

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("🚀 Starting SOP Document Manager Plus...\n");

// Check if database exists, if not initialize it
const dbPath = join(__dirname, "..", "data", "documents.db");
if (!fs.existsSync(dbPath)) {
  console.log("📊 Database not found. Initializing...");

  try {
    // Run database initialization
    const initProcess = spawn("node", ["scripts/init-db.js"], {
      stdio: "inherit",
      cwd: join(__dirname, ".."),
    });

    initProcess.on("close", (code) => {
      if (code === 0) {
        console.log("✅ Database initialized successfully!");
        seedDatabase();
      } else {
        console.error("❌ Database initialization failed!");
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    process.exit(1);
  }
} else {
  console.log("✅ Database already exists.");
  startServer();
}

function seedDatabase() {
  console.log("🌱 Seeding database with sample data...");

  try {
    const seedProcess = spawn("node", ["scripts/seed-db.js"], {
      stdio: "inherit",
      cwd: join(__dirname, ".."),
    });

    seedProcess.on("close", (code) => {
      if (code === 0) {
        console.log("✅ Database seeded successfully!");
        startServer();
      } else {
        console.error("❌ Database seeding failed!");
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

function startServer() {
  console.log("🚀 Starting server...");

  try {
    const serverProcess = spawn("node", ["server/index.js"], {
      stdio: "inherit",
      cwd: join(__dirname, ".."),
    });

    serverProcess.on("close", (code) => {
      console.log(`\n🛑 Server stopped with code ${code}`);
      process.exit(code);
    });

    serverProcess.on("error", (error) => {
      console.error("❌ Error starting server:", error);
      process.exit(1);
    });

    // Handle process termination
    process.on("SIGINT", () => {
      console.log("\n🛑 Shutting down...");
      serverProcess.kill("SIGINT");
    });

    process.on("SIGTERM", () => {
      console.log("\n🛑 Shutting down...");
      serverProcess.kill("SIGTERM");
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1);
  }
}

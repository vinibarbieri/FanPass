const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();

const ticketRoutes = require("./routes/ticketRoutes");
const userRoutes = require("./routes/userRoutes");
const marketplaceRoutes = require("./routes/marketplaceRoutes");
const stripeRoutes = require("./routes/stripeRoutes");

class App {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupDatabase();
  }

  setupMiddleware() {
    this.app.use(
      cors({
        origin: [
          "https://gateway.pinata.cloud",
          "https://www.pinata.cloud",
          "http://localhost:5173",
          "http://127.0.0.1:5173",
        ],
        allowedHeaders: [
          "Content-Type",
          "Authorization",
          "X-Requested-With",
          "Accept",
        ],
      })
    );

    this.app.use(express.json());
  }

  setupRoutes() {
    this.app.use("/ticket", ticketRoutes);
    this.app.use("/users", userRoutes);
    this.app.use("/marketplace", marketplaceRoutes);
    this.app.use("/stripe", stripeRoutes);
  }

  async setupDatabase() {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      process.exit(1);
    }
  }

  start() {
    const PORT = process.env.PORT || 3001;
    this.app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
}

module.exports = new App();

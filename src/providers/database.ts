import mongoose from "mongoose";

import { ConsoleHandler } from "../utils/consoleHandler";
import ConfigService from "./config";
class Database {
  private static isConnected = false;

  private static logger = ConsoleHandler.getInstance("Database");

  public static async init(): Promise<void> {
    if (this.isConnected) {
      this.logger.warn("Already connected");
      return;
    }

    const config = ConfigService.getInstance().getConfig();
    const dsn = config.MONGO_URI;

    try {
      mongoose.set("strictQuery", false);

      mongoose.connection.on("connected", () => {
        this.isConnected = true;
        this.logger.log("Connected successfully");
      });

      mongoose.connection.on("error", (err) => {
        this.logger.handleError(err);
      });

      mongoose.connection.on("disconnected", () => {
        this.isConnected = false;
        this.logger.warn("MongoDB Disconnected");
      });

      const mongooseOptions = {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      } as mongoose.ConnectOptions;

      await mongoose.connect(dsn, mongooseOptions);
    } catch (error) {
      this.isConnected = false;
      this.logger.handleError(error as Error);
      throw error;
    }
  }

  public static async disconnect(): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn("No active connection");
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      this.logger.warn("Successfully disconnected");
    } catch (error) {
      this.logger.handleError(error as Error);
      throw error;
    }
  }

  public static async reconnect(): Promise<void> {
    if (this.isConnected) {
      await this.disconnect();
    }
    await this.init();
  }

  public static getConnection(): mongoose.Connection {
    return mongoose.connection;
  }

  public static isConnectedToDatabase(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

// Use top-level await to handle program termination signals
process.on("SIGINT", async () => {
  const logger = ConsoleHandler.getInstance("Database");
  try {
    await Database.disconnect();
    process.exit(0);
  } catch (error) {
    logger.handleError(error as Error);
    process.exit(1);
  }
});

export default Database;

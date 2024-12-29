import mongoose from "mongoose";

import ConfigService from "./config";

export class Database {
  private static isConnected = false;

  public static async init(): Promise<void> {
    if (this.isConnected) {
      console.log("\x1b[33m%s\x1b[0m", "Database    :: Already connected");
      return;
    }

    const config = ConfigService.getInstance().getConfig();
    const dsn = config.MONGO_URI;

    try {
      // 設置 mongoose 選項
      mongoose.set("strictQuery", false);

      // 添加連接監聽器
      mongoose.connection.on("connected", () => {
        this.isConnected = true;
        console.log("\x1b[32m%s\x1b[0m", "Database    :: Connected successfully");
      });

      mongoose.connection.on("error", (err) => {
        console.error("\x1b[31m%s\x1b[0m", "Database   :: MongoDB Connection error:", err);
      });

      mongoose.connection.on("disconnected", () => {
        this.isConnected = false;
        console.log("\x1b[33m%s\x1b[0m", "Database    :: MongoDB Disconnected");
      });

      // 設置連接選項
      const mongooseOptions = {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      // 建立連接
      await mongoose.connect(dsn, mongooseOptions);
    } catch (error) {
      this.isConnected = false;
      console.error("\x1b[31m%s\x1b[0m", "Database    :: MongoDB Connection error:", error);
      throw error;
    }
  }

  public static async disconnect(): Promise<void> {
    if (!this.isConnected) {
      console.log("\x1b[33m%s\x1b[0m", "Database    :: No active connection");
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log("\x1b[32m%s\x1b[0m", "Database    :: Successfully disconnected");
    } catch (error) {
      console.error("\x1b[31m%s\x1b[0m", "Database    :: Error disconnecting:", error);
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

// 處理程序終止信號
process.on("SIGINT", async () => {
  try {
    await Database.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("\x1b[31m%s\x1b[0m", "Database    :: Error during cleanup:", error);
    process.exit(1);
  }
});

export default mongoose;

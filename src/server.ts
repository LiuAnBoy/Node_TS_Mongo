// index.ts 或 server.ts
import { Database } from "./providers/database";
import Express from "./providers/express";

class Server {
  private static async gracefulShutdown(signal: string): Promise<void> {
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    try {
      // close express server
      await Express.shutdown();
      console.log("Server      :: server closed.");

      // close database connection
      await Database.disconnect();
      console.log("Database    :: connection closed.");

      console.log("Application :: graceful shutdown completed.");
      process.exit(0);
    } catch (error) {
      console.error("Application :: Error during graceful shutdown:", error);
      process.exit(1);
    }
  }

  private static registerShutdownHandlers(): void {
    // handle graceful shutdown signals
    ["SIGTERM", "SIGINT", "SIGUSR2"].forEach((signal) => {
      process.on(signal, () => this.gracefulShutdown(signal));
    });

    // handle uncaught exceptions
    process.on("unhandledRejection", (reason, promise) => {
      console.error("Application :: Unhandled Rejection at:", promise, "reason:", reason);
      this.gracefulShutdown("UNHANDLED_REJECTION");
    });

    process.on("uncaughtException", (error) => {
      console.error("Application :: Uncaught Exception:", error);
      this.gracefulShutdown("UNCAUGHT_EXCEPTION");
    });
  }

  public static async start(): Promise<void> {
    try {
      this.registerShutdownHandlers();

      // init express
      await Express.init();
      await Express.start();

      // init database
      await Database.init();
      console.log("\x1b[33m%s\x1b[0m", "Application :: Server started");
    } catch (error) {
      console.error("\x1b[31m%s\x1b[0m", "Application :: Failed to start:", error);
      process.exit(1);
    }
  }
}

// run server
Server.start();

import Express from "./providers/express";
import { ConsoleHandler } from "./utils/consoleHandler";

class Server {
  private static logger = ConsoleHandler.getInstance("Server");

  private static async gracefulShutdown(signal: string): Promise<void> {
    this.logger.log(`${signal} received. Starting graceful shutdown...`);

    try {
      // close express server
      await Express.shutdown();
      this.logger.log("server closed.");

      this.logger.log("graceful shutdown completed.");
      process.exit(0);
    } catch (error) {
      this.logger.handleError(error as Error);
      process.exit(1);
    }
  }

  private static registerShutdownHandlers(): void {
    // handle graceful shutdown signals
    ["SIGTERM", "SIGINT", "SIGUSR2"].forEach((signal) => {
      process.on(signal, () => this.gracefulShutdown(signal));
    });

    // handle uncaught exceptions
    process.on("unhandledRejection", (reason) => {
      this.logger.handleError(reason as Error);
      this.gracefulShutdown("UNHANDLED_REJECTION");
    });

    process.on("uncaughtException", (error) => {
      this.logger.handleError(error);
      this.gracefulShutdown("UNCAUGHT_EXCEPTION");
    });
  }

  public static async start(): Promise<void> {
    try {
      this.registerShutdownHandlers();

      // init express
      await Express.init();

      // start express
      await Express.start();

      this.logger.log("Server started");
    } catch (error) {
      this.logger.error("Failed to start:");
      this.logger.handleError(error as Error);
      process.exit(1);
    }
  }
}

// run server
Server.start();

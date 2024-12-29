import express, { Application } from "express";
import http from "http";

import Middleware from "../middlewares";
import ConfigService from "./config";

class Express {
  public express: Application;
  private server: http.Server | null;
  private activeConnections: { [key: string]: any } = {};

  constructor() {
    this.express = express();
    this.server = null;
  }

  private mountConfig(): void {
    const config = ConfigService.getInstance();
    this.express = config.init(this.express);
  }

  private mountMiddlewares(): void {
    this.express = Middleware.init(this.express);
  }

  public init(): Application {
    this.mountConfig();
    this.mountMiddlewares();
    return this.express;
  }

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const port = ConfigService.getInstance().getConfig().PORT;

        this.server = this.express.listen(port, () => {
          console.log(
            "\x1b[32m%s\x1b[0m",
            `Server      :: Running SERVER @ 'http://localhost:${port}'`,
          );
          resolve();
        });

        this.server.on("error", (error) => {
          console.error("\x1b[31m%s\x1b[0m", "Server      :: Error:", error.message);
          reject(error);
        });

        // handle HTTP keep-alive connections
        this.server.keepAliveTimeout = 65000;
        this.server.headersTimeout = 66000;
      } catch (error) {
        console.error("\x1b[31m%s\x1b[0m", "Server      :: Failed to start:", error);
        reject(error);
      }
    });
  }

  public async shutdown(): Promise<void> {
    if (!this.server) {
      console.log("Server      :: No server instance running");
      return;
    }

    return new Promise((resolve, reject) => {
      console.log("\x1b[33m%s\x1b[0m", "Server      :: Shutting down...");

      // stop accepting new requests
      this.server?.close((err) => {
        if (err) {
          console.error("\x1b[31m%s\x1b[0m", "Server      :: Error during shutdown:", err);
          reject(err);
          return;
        }

        console.log("\x1b[32m%s\x1b[0m", "Server      :: Shutdown completed");
        this.server = null;
        resolve();
      });

      // set timeout to force shutdown
      setTimeout(() => {
        console.error("\x1b[31m%s\x1b[0m", "Server      :: Forced shutdown due to timeout");
        reject(new Error("Server shutdown timeout"));
      }, 30000); // 30秒超時

      // close all existing connections
      if (this.server) {
        this.activeConnections = {};

        this.server.on("connection", (socket) => {
          const socketId = socket.remoteAddress + ":" + socket.remotePort;
          this.activeConnections[socketId] = socket;

          socket.on("close", () => {
            delete this.activeConnections[socketId];
          });
        });

        // Close all existing connections
        Object.values(this.activeConnections).forEach((socket: any) => {
          socket.destroy();
        });
      }
    });
  }
}

// 導出單例
export default new Express();

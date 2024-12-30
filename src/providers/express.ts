import express, { Application } from "express";
import http from "http";

import Middleware from "../middlewares";
import { ConsoleHandler } from "../utils/consoleHandler";
import ConfigService from "./config";
import Route from "./route";
/* eslint-disable @typescript-eslint/no-explicit-any */
class Express {
  public express: Application;
  private server: http.Server | null;
  private activeConnections: { [key: string]: any } = {};
  private logger: ConsoleHandler;

  constructor() {
    this.express = express();
    this.server = null;
    this.logger = ConsoleHandler.getInstance("Express");
  }

  private mountConfig(): void {
    const config = ConfigService.getInstance();
    this.express = config.init(this.express);
  }

  private mountMiddlewares(): void {
    this.express = Middleware.init(this.express);
  }

  private mountRoutes(): void {
    this.express = Route.init(this.express);
  }

  public init(): Application {
    this.mountConfig();
    this.mountMiddlewares();
    this.mountRoutes();
    return this.express;
  }

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const port = ConfigService.getInstance().getConfig().PORT;

        this.server = this.express.listen(port, () => {
          this.logger.log(`Running SERVER @ 'http://localhost:${port}'`);
          resolve();
        });

        this.server.on("error", (error) => {
          this.logger.error("Error");
          reject(error);
        });

        // handle HTTP keep-alive connections
        this.server.keepAliveTimeout = 65000;
        this.server.headersTimeout = 66000;
      } catch (error) {
        this.logger.error("Failed to start:");
        reject(error);
      }
    });
  }

  public async shutdown(): Promise<void> {
    if (!this.server) {
      this.logger.warn("No server instance running");
      return;
    }

    return new Promise((resolve, reject) => {
      this.logger.warn("Shutting down...");

      // stop accepting new requests
      this.server?.close((err) => {
        if (err) {
          this.logger.error("Error during shutdown:");
          reject(err);
          return;
        }

        this.logger.log("Shutdown completed");
        this.server = null;
        resolve();
      });

      // set timeout to force shutdown
      setTimeout(() => {
        this.logger.error("Forced shutdown due to timeout");
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

import * as dotenv from "dotenv";
import { Application } from "express";

import { ConsoleHandler } from "../utils/consoleHandler";
import REQUIRED_ENV_VARS from "../utils/required_env";

class ConfigService {
  private static instance: ConfigService;
  private readonly config: EnvConfig;
  private readonly logger: ConsoleHandler;

  private constructor() {
    this.logger = ConsoleHandler.getInstance("Configuration");

    try {
      this.validateEnvFile();
      dotenv.config();
      this.validateRequiredEnvVars();
      this.config = this.loadConfig();
      this.validateConfig();
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw error;
    }
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private loadConfig(): EnvConfig {
    try {
      const config = {
        PORT: Number(process.env.PORT) || DEFAULT_CONFIG.PORT,
        MONGO_URI: process.env.MONGO_URI || DEFAULT_CONFIG.MONGO_URI,
      };
      return config;
    } catch (error) {
      this.logger.error(`Environment variables loading failed: ${error}`);
      throw error;
    }
  }

  private validateEnvFile(): void {
    const result = dotenv.config();
    if (result.error) {
      throw result.error;
    }
  }

  private validateRequiredEnvVars(): void {
    const missingVars = REQUIRED_ENV_VARS.filter((envVar) => !process.env[envVar]);

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
    }
  }

  private validateConfig(): void {
    if (isNaN(this.config.PORT) || this.config.PORT <= 0) {
      throw new Error("PORT must be a valid number greater than 0");
    }

    if (
      !this.config.MONGO_URI.startsWith("mongodb://") &&
      !this.config.MONGO_URI.startsWith("mongodb+srv://")
    ) {
      throw new Error("MONGO_URI is invalid");
    }
  }

  public getConfig(): EnvConfig {
    return this.config;
  }

  public init(_express: Application): Application {
    _express.locals.config = this.config;
    this.logger.log("Configuration mounted");
    return _express;
  }
}

export default ConfigService;

export interface EnvConfig {
  PORT: number;
  MONGO_URI: string;
}

const DEFAULT_CONFIG: EnvConfig = {
  PORT: 8000,
  MONGO_URI: "",
};

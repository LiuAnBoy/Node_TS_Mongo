import * as dotenv from "dotenv";
import { Application } from "express";

import { ConsoleHandler } from "../utils/consoleHandler";

const REQUIRED_ENV_VARS = [
  "MONGO_URI",
  "LOGIN_CHANNEL_SECRET",
  "LOGIN_CHANNEL_ID",
  "MSG_CHANNEL_SECRET",
  "MSG_CHANNEL_ACCESS_TOKEN",
  "RENT_URL",
  "RENT_API_URL",
  "NOTIFY_CHANNEL_ID",
  "NOTIFY_CHANNEL_SECRET",
] as const;

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
        APP_URL: process.env.APP_URL || DEFAULT_CONFIG.APP_URL,
        MONGO_URI: process.env.MONGO_URI || DEFAULT_CONFIG.MONGO_URI,
        LOGIN_CHANNEL_SECRET:
          process.env.LOGIN_CHANNEL_SECRET || DEFAULT_CONFIG.LOGIN_CHANNEL_SECRET,
        LOGIN_CHANNEL_ID: process.env.LOGIN_CHANNEL_ID || DEFAULT_CONFIG.LOGIN_CHANNEL_ID,
        MSG_CHANNEL_SECRET: process.env.MSG_CHANNEL_SECRET || DEFAULT_CONFIG.MSG_CHANNEL_SECRET,
        MSG_CHANNEL_ACCESS_TOKEN:
          process.env.MSG_CHANNEL_ACCESS_TOKEN || DEFAULT_CONFIG.MSG_CHANNEL_ACCESS_TOKEN,
        RENT_URL: process.env.RENT_URL || DEFAULT_CONFIG.RENT_URL,
        RENT_API_URL: process.env.RENT_API_URL || DEFAULT_CONFIG.RENT_API_URL,
        NOTIFY_CHANNEL_ID: process.env.NOTIFY_CHANNEL_ID || DEFAULT_CONFIG.NOTIFY_CHANNEL_ID,
        NOTIFY_CHANNEL_SECRET:
          process.env.NOTIFY_CHANNEL_SECRET || DEFAULT_CONFIG.NOTIFY_CHANNEL_SECRET,
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

    try {
      new URL(this.config.APP_URL);
    } catch {
      throw new Error("APP_URL is invalid");
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
  APP_URL: string;
  MONGO_URI: string;
  LOGIN_CHANNEL_SECRET: string;
  LOGIN_CHANNEL_ID: string;
  MSG_CHANNEL_SECRET: string;
  MSG_CHANNEL_ACCESS_TOKEN: string;
  RENT_URL: string;
  RENT_API_URL: string;
  NOTIFY_CHANNEL_ID: string;
  NOTIFY_CHANNEL_SECRET: string;
}

const DEFAULT_CONFIG: EnvConfig = {
  PORT: 8000,
  APP_URL: "http://localhost:8000",
  MONGO_URI: "",
  LOGIN_CHANNEL_SECRET: "",
  LOGIN_CHANNEL_ID: "",
  MSG_CHANNEL_SECRET: "",
  MSG_CHANNEL_ACCESS_TOKEN: "",
  RENT_URL: "",
  RENT_API_URL: "",
  NOTIFY_CHANNEL_ID: "",
  NOTIFY_CHANNEL_SECRET: "",
};

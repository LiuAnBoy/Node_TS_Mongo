import * as dotenv from "dotenv";
import { Application } from "express";

class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

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

  private constructor() {
    this.validateEnvFile();
    dotenv.config();
    this.validateRequiredEnvVars();
    this.config = this.loadConfig();
    this.validateConfig();
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      try {
        ConfigService.instance = new ConfigService();
      } catch (error) {
        if (error instanceof ConfigurationError) {
          console.error("\x1b[31m%s\x1b[0m", `Configuration Error: ${error.message}`);
        }
        throw error;
      }
    }
    return ConfigService.instance;
  }

  private loadConfig(): EnvConfig {
    try {
      return {
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
    } catch (error) {
      throw new ConfigurationError(`Environment variable loading failed: ${error}`);
    }
  }

  private validateEnvFile(): void {
    try {
      const result = dotenv.config();
      if (result.error) {
        throw new ConfigurationError(".env does not exist!");
      }
    } catch (error) {
      throw new ConfigurationError(`Environment variable loading failed: ${error}`);
    }
  }

  private validateRequiredEnvVars(): void {
    const missingVars = REQUIRED_ENV_VARS.filter((envVar) => !process.env[envVar]);

    if (missingVars.length > 0) {
      throw new ConfigurationError(
        `Missing required environment variables: ${missingVars.join(", ")}`,
      );
    }
  }

  private validateConfig(): void {
    if (isNaN(this.config.PORT) || this.config.PORT <= 0) {
      throw new ConfigurationError("PORT must be a valid number greater than 0");
    }

    try {
      new URL(this.config.APP_URL);
    } catch {
      throw new ConfigurationError("APP_URL is invalid");
    }

    if (
      !this.config.MONGO_URI.startsWith("mongodb://") &&
      !this.config.MONGO_URI.startsWith("mongodb+srv://")
    ) {
      throw new ConfigurationError("MONGO_URI is invalid");
    }
  }

  public getConfig(): EnvConfig {
    return this.config;
  }

  public init(_express: Application): Application {
    _express.locals.config = this.config;
    console.log("\x1b[32m%s\x1b[0m", "App         :: Config loaded");
    return _express;
  }
}

export default ConfigService;

interface EnvConfig {
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

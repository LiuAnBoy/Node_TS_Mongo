import cors from "cors";
import { Application } from "express";

import ConfigService from "../providers/config";
import { ConsoleHandler } from "../utils/consoleHandler";

class CORS {
  public static mount(_express: Application): Application {
    const config = ConfigService.getInstance().getConfig();
    const logger = ConsoleHandler.getInstance("Middleware");
    const options = {
      origin: config.APP_URL,
      optionsSuccessStatus: 200, // Some legacy browsers choke on 204
    };

    _express.use(cors(options));

    logger.log("Mount CORS middleware");

    return _express;
  }
}

export default CORS;

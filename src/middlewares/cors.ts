import cors from "cors";
import { Application } from "express";

import { ConsoleHandler } from "../utils/consoleHandler";

class CORS {
  public static mount(_express: Application): Application {
    const logger = ConsoleHandler.getInstance("Middleware");
    const options = {
      origin: "*",
      optionsSuccessStatus: 200, // Some legacy browsers choke on 204
    };

    _express.use(cors(options));

    logger.log("Mount CORS middleware");

    return _express;
  }
}

export default CORS;

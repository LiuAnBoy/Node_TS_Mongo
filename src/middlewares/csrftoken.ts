import { Application } from "express";

import { ConsoleHandler } from "../utils/consoleHandler";

class CsrfToken {
  public static mount(_express: Application): Application {
    const logger = ConsoleHandler.getInstance("Middleware");
    _express.set("trust proxy", 1);

    logger.log("Mount CSRFToken middleware");

    return _express;
  }
}

export default CsrfToken;

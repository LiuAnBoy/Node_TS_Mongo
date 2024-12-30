import bodyParser from "body-parser";
import compression from "compression";
import cors from "cors";
import { Application } from "express";
import morgan from "morgan";

import { ConsoleHandler } from "../utils/consoleHandler";

class Http {
  public static mount(_express: Application): Application {
    const logger = ConsoleHandler.getInstance("Middleware");
    _express.use(bodyParser.urlencoded({ extended: false }));

    _express.use(morgan("dev"));

    // Disable the x-powered-by header in response
    _express.disable("x-powered-by");

    // Enables the CORS
    _express.use(cors());

    // Enables the "gzip" / "deflate" compression for response
    _express.use(compression());

    logger.log("Mount Http middleware");

    return _express;
  }
}

export default Http;

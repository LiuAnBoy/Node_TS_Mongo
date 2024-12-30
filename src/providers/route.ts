import bodyParser from "body-parser";
import { Application } from "express";

import Router from "../routes/example";
import { ConsoleHandler } from "../utils/consoleHandler";

class Route {
  public mountApiRoutes(_express: Application): Application {
    return _express.use("/api/v1", bodyParser.json(), Router);
  }

  public init(_express: Application): Application {
    const logger = ConsoleHandler.getInstance("Route");
    this.mountApiRoutes(_express);

    logger.log("Mount API routes");
    return _express;
  }
}

export default new Route();

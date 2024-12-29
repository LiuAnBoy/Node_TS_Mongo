import cors from "cors";
import { Application } from "express";

import ConfigService from "../providers/config";

class CORS {
  public static mount(_express: Application): Application {
    const config = ConfigService.getInstance().getConfig();
    const options = {
      origin: config.APP_URL,
      optionsSuccessStatus: 200, // Some legacy browsers choke on 204
    };

    _express.use(cors(options));

    console.log("\x1b[32m%s\x1b[0m", "Middleware  :: Mount CORS middleware");

    return _express;
  }
}

export default CORS;

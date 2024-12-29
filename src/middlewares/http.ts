import bodyParser from "body-parser";
import compression from "compression";
import cors from "cors";
import { Application } from "express";
import morgan from "morgan";

class Http {
  public static mount(_express: Application): Application {
    _express.use(bodyParser.urlencoded({ extended: false }));

    _express.use(morgan("dev"));

    // Disable the x-powered-by header in response
    _express.disable("x-powered-by");

    // Enables the CORS
    _express.use(cors());

    // Enables the "gzip" / "deflate" compression for response
    _express.use(compression());

    console.log("\x1b[32m%s\x1b[0m", "Middleware  :: Mount Http middleware");

    return _express;
  }
}

export default Http;

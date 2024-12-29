import { Application } from "express";

class CsrfToken {
  public static mount(_express: Application): Application {
    _express.set("trust proxy", 1);

    console.log("\x1b[32m%s\x1b[0m", "Middleware  :: Mount CSRFToken middleware");

    return _express;
  }
}

export default CsrfToken;

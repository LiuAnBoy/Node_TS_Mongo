import { Application } from "express";

import CORS from "./cors";
import CsrfToken from "./csrftoken";
import Http from "./http";

/* eslint no-param-reassign: "off" */
class Middleware {
  public static init(_express: Application): Application {
    // Mount basic express apis middleware
    _express = Http.mount(_express);

    // Mount csrf token verification middleware
    _express = CsrfToken.mount(_express);

    // Mount CORS middleware
    _express = CORS.mount(_express);

    return _express;
  }
}

export default Middleware;

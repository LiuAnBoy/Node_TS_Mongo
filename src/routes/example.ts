import { Request, Response, Router } from "express";

const router = Router();

router.get("/hello", async (req: Request, res: Response) => {
  res.send("Hello World");
});

export default router;

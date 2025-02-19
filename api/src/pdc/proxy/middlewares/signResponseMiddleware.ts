import { createHash } from "@/lib/crypto/index.ts";
import { Request, Response } from "dep:express";
import expressMung from "dep:express-mung";

export const signResponseMiddleware = expressMung.jsonAsync(
  async (_body: {}, req: Request, res: Response): Promise<void> => {
    res.header("X-Response-SHA256", await createHash(req.body));
  },
);

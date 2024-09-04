import { expressMung, Request, Response } from "@/deps.ts";
import { createHash } from "@/lib/crypto/index.ts";

export const signResponseMiddleware = expressMung.jsonAsync(
  async (_body: {}, req: Request, res: Response): Promise<void> => {
    res.header("X-Response-SHA256", await createHash(req.body));
  },
);

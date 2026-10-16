import { assertEquals } from "dep:assert";
import express, { Request, Response } from "dep:express";
import { MemoryStore } from "dep:express-rate-limit";
import { describe, it } from "dep:testing-bdd";
import { rateLimiter } from "./rateLimiter.ts";

// Serveur Express réel derrière un proxy de confiance : req.ip vient de X-Forwarded-For.
async function withServer(max: number, fn: (hit: (ip: string) => Promise<number>) => Promise<void>) {
  const app = express();
  app.set("trust proxy", 1);
  app.use(rateLimiter({ max, store: new MemoryStore() }));
  app.get("/", (_req: Request, res: Response) => res.send("ok"));
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address() as { port: number };
  const hit = async (ip: string) => {
    const res = await fetch(`http://127.0.0.1:${port}/`, { headers: { "x-forwarded-for": ip } });
    await res.text();
    return res.status;
  };
  try {
    await fn(hit);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

describe("rateLimiter", () => {
  it("blocks the third request from the same IPv4 address", async () => {
    await withServer(2, async (hit) => {
      const codes = [await hit("203.0.113.9"), await hit("203.0.113.9"), await hit("203.0.113.9")];
      assertEquals(codes, [200, 200, 429]);
    });
  });

  // Un client IPv6 dispose d'un /64 entier : compter par /128 revient à ne rien limiter.
  it("buckets IPv6 addresses of the same /64 together", async () => {
    await withServer(2, async (hit) => {
      const codes = [await hit("2001:db8:0:1::1"), await hit("2001:db8:0:1::2"), await hit("2001:db8:0:1::3")];
      assertEquals(codes, [200, 200, 429]);
    });
  });
});

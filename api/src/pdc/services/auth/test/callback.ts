import { ConfigInterfaceResolver } from "@/ilos/common/index.ts";
import { safeCompare } from "@/lib/crypto/safeCompare.ts";
import { asyncHandler } from "@/pdc/proxy/helpers/asyncHandler.ts";
import { Request, Response } from "dep:express";
import { getPermissions } from "../config/permissions.ts";

function rpcError(res: Response, code: number, message: string) {
  return res.status(code).json({ id: 1, jsonrpc: "2.0", error: { code, data: "Error", message } });
}

export const testCallbackRoute = (config: ConfigInterfaceResolver) =>
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) return rpcError(res, 400, "Bad Request");

    const expected = config.get("test.accounts")().get(email);
    if (!expected || !safeCompare(password, expected)) return rpcError(res, 401, "Unauthorized Error");

    const kind = email.includes("admin") ? "registry" : email.includes("operator") ? "operator" : "territory";
    const user: Record<string, unknown> = {
      email,
      name: `Test ${kind} user`,
      role: `${kind}.admin`,
      permissions: getPermissions(`${kind}.admin`),
    };
    if (kind === "operator") user.operator_id = 1;
    if (kind === "territory") user.territory_id = 1;

    await new Promise<void>((resolve, reject) =>
      req.session.regenerate((err?: Error) => (err ? reject(err) : resolve()))
    );
    req.session.auth = { id_token: 1, test_login: true };
    req.session.user = user;

    return res.json(user);
  });

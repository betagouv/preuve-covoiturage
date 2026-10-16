import { asyncHandler } from "@/pdc/proxy/helpers/asyncHandler.ts";
import { sessionRef } from "@/pdc/proxy/helpers/sessionRef.ts";
import { UserRepository } from "@/pdc/services/auth/providers/UserRepository.ts";
import { Request, Response } from "dep:express";
import { proconnectLog } from "./providers/proconnectLog.ts";

function unauthorized(res: Response) {
  return res.status(401).json({
    id: 1,
    jsonrpc: "2.0",
    error: { code: 401, data: "Error", message: "Unauthorized Error" },
  });
}

/**
 * Session courante. Le compte est relu en base : un utilisateur supprimé garde sinon
 * un cookie valide jusqu'à expiration. Les scopes ne sont pas rafraîchis ici.
 */
export function meRoute(userRepository: UserRepository, cookieName: string) {
  return asyncHandler(async (req: Request, res: Response) => {
    const user = req.session?.user;
    if (!user) return unauthorized(res);

    if (await userRepository.findById(user._id)) return res.json(user);

    proconnectLog.info("session revoked", { session: await sessionRef(req.sessionID), user_id: user._id });
    await new Promise<void>((resolve) => req.session.destroy(() => resolve()));
    res.clearCookie(cookieName);
    return unauthorized(res);
  });
}

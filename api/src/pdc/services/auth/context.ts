import { asyncHandler } from "@/pdc/proxy/helpers/asyncHandler.ts";
import { UserScope, UserScopeRepository } from "@/pdc/services/auth/providers/UserScopeRepository.ts";
import { Request, Response } from "dep:express";

// Réponse d'erreur au format JSON-RPC (même forme que /auth/me).
function jsonRpcError(res: Response, code: number, message: string) {
  return res.status(code).json({ id: 1, jsonrpc: "2.0", error: { code, data: "Error", message } });
}

// Type opérateur : scope actif opérateur, ou présence d'au moins un scope opérateur.
function isOperatorUser(user: { operator_id?: number | null; scopes?: UserScope[] }): boolean {
  if (user.operator_id != null) return true;
  return (user.scopes ?? []).some((s) => s.operator_id != null);
}

/**
 * Bascule le contexte actif d'un user territoire vers un de ses territoires.
 * La liste session.scopes[] ne sert qu'à l'affichage ; l'autorisation vient de la DB.
 */
export function contextRoute(userScopeRepository: UserScopeRepository) {
  return asyncHandler(async (req: Request, res: Response) => {
    // 401 : garde locale, ne dépend d'aucun middleware qui no-op sur le cookie.
    if (!req.session?.user) return jsonRpcError(res, 401, "Unauthorized Error");
    const user = req.session.user;

    // Body : territory_id entier strictement positif requis.
    const territoryId = req.body?.territory_id;
    if (!Number.isInteger(territoryId) || territoryId <= 0) return jsonRpcError(res, 400, "Bad Request");

    // Seul un user de type territoire bascule ; un opérateur n'a qu'un scope.
    if (isOperatorUser(user)) return jsonRpcError(res, 403, "Forbidden Error");

    // Revalidation DB : match strict sur territory_id (anti-IDOR par collision op/territoire).
    if (!(await userScopeRepository.userHasTerritory(user._id, territoryId))) {
      return jsonRpcError(res, 403, "Forbidden Error");
    }

    // Réécrit tout le tuple actif : territoire ciblé, opérateur purgé.
    user.territory_id = territoryId;
    user.operator_id = null;
    await new Promise<void>((resolve, reject) => req.session.save((err: Error) => err ? reject(err) : resolve()));

    // Libellé d'affichage depuis les scopes autorisés (fallback vide).
    const label = (user.scopes ?? []).find((s: UserScope) => s.territory_id === territoryId)?.label ?? "";
    return res.json({ territory_id: territoryId, label });
  });
}

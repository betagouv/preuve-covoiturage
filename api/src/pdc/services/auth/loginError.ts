import { MfaRequiredError } from "./providers/ProConnectOIDCProvider.ts";

// Codes `?error=` renvoyés au front ; la raison précise reste dans les logs (cf. app-partners LoginErrorAlert).
export type LoginErrorCode = "mfa_required" | "unauthorized" | "login_failed";

// name en second critère : instanceof casse si le module est résolu deux fois
export function loginErrorCode(e: unknown): LoginErrorCode {
  if (e instanceof MfaRequiredError || (e as Error)?.name === "MfaRequiredError") return "mfa_required";
  return "login_failed";
}

import { createHash } from "@/lib/crypto/index.ts";

// Empreinte pour corréler les logs d'une session : l'identifiant brut vaut le cookie, il ne doit pas sortir.
export async function sessionRef(sessionID?: string): Promise<string | undefined> {
  if (!sessionID) return undefined;
  return (await createHash(sessionID)).substring(0, 8);
}

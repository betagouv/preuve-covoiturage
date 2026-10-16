import { Config } from "@/config";

export interface LoginErrorMessage {
  severity: "error" | "warning";
  title: string;
  description: string;
  // Adresse du support à afficher à la suite de la description (lien mailto).
  support?: string;
}

// Codes `?error=` renvoyés par l'API après le callback ProConnect (cf. AuthRouter).
export function loginErrorMessage(code: string | null): LoginErrorMessage | null {
  const support = Config.get<string>("contact.email");
  switch (code) {
    case "mfa_required":
      return {
        severity: "error",
        title: "Double authentification requise",
        description:
          "Vous ne pouvez pas accéder au service sans avoir une double authentification installée. Veuillez installer une application d'authentification sur votre compte ProConnect, puis vous connecter à nouveau.",
      };
    case "unauthorized":
      return {
        severity: "error",
        title: "Compte non reconnu",
        description: "Votre compte n'est pas enregistré sur la plateforme, contactez notre support : ",
        support,
      };
    case "login_failed":
      return {
        severity: "error",
        title: "Connexion impossible",
        description: "La connexion a échoué, réessayez. Si le problème persiste, contactez notre support : ",
        support,
      };
    default:
      return null;
  }
}

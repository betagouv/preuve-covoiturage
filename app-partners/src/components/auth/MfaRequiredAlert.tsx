"use client";

import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { useSearchParams } from "next/navigation";

export default function MfaRequiredAlert() {
  const searchParams = useSearchParams();
  if (searchParams.get("error") !== "mfa_required") return null;
  return (
    <Alert
      severity="error"
      title="Double authentification requise"
      description="Vous ne pouvez pas accéder au service sans avoir une double authentification installée. Veuillez installer une application d'authentification sur votre compte ProConnect, puis vous connecter à nouveau."
      className={fr.cx("fr-mb-4w")}
    />
  );
}

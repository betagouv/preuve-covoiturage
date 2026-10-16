"use client";

import { loginErrorMessage } from "@/helpers/loginError";
import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { useSearchParams } from "next/navigation";

// Le paramètre reste dans l'URL : AuthProvider ne redirige pas sur `/` pour laisser le message s'afficher.
export default function LoginErrorAlert() {
  const searchParams = useSearchParams();
  const message = loginErrorMessage(searchParams.get("error"));
  if (!message) return null;

  return (
    <Alert
      closable
      severity={message.severity}
      title={message.title}
      description={
        <>
          {message.description}
          {message.support && <a href={`mailto:${message.support}`}>{message.support}</a>}
        </>
      }
      className={fr.cx("fr-mb-4w")}
    />
  );
}

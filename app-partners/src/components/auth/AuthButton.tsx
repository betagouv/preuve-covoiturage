"use client";
import { Config } from "@/config";
import { useAuth } from "@/providers/AuthProvider";
import { ProConnectButton } from "@codegouvfr/react-dsfr/ProConnectButton";
import { useRouter } from "next/navigation";

// Connexion ProConnect hors session ; la déconnexion vit dans UserMenu.
export function AuthButton() {
  const { isAuth } = useAuth();
  const router = useRouter();
  if (isAuth) return null;

  return <ProConnectButton onClick={() => router.push(`${Config.get<string>("auth.domain")}/auth/login`)} />;
}

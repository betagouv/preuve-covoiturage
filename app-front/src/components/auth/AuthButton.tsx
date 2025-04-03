"use client";
import { Config } from "@/config";
import { useAuth } from "@/providers/AuthProvider";
import Button from "@codegouvfr/react-dsfr/Button";

import { ProConnectButton } from "@codegouvfr/react-dsfr/ProConnectButton";
import { useRouter } from "next/navigation";

export function AuthButton() {
  const { isAuth, logout } = useAuth();
  const router = useRouter();

  const authClick = () => {
    const url = `${Config.get<string>("auth.domain")}/auth/login`;
    router.push(url);
  };
  const authLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <>
      {!isAuth && <ProConnectButton onClick={() => authClick()} />}
      {isAuth && (
        <Button
          linkProps={{
            href: "",
            onClick: authLogout,
          }}
        >
          Déconnexion
        </Button>
      )}
    </>
  );
}

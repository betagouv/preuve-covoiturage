"use client";
import { Config } from "@/config";
import { useAuth } from "@/providers/AuthProvider";
import Button from "@codegouvfr/react-dsfr/Button";

import { ProConnectButton } from "@codegouvfr/react-dsfr/ProConnectButton";
import { useRouter } from "next/navigation";

export function AuthButton() {
  const { isAuth, logout, user } = useAuth();
  const router = useRouter();

  const authClick = () => {
    const url = `${Config.get<string>("auth.domain")}/auth/login`;
    router.push(url);
  };
  const authLogout = async () => {
    await logout();
    router.push(`${Config.get<string>("auth.domain")}/auth/logout`);
  };

  return (
    <>
      {!isAuth && <ProConnectButton onClick={() => authClick()} />}
      {isAuth && (
        <>
          <Button
            priority="primary"
            linkProps={{
              href: "",
              onClick: () => {
                authLogout().catch(console.error);
              },
            }}
          >
            Déconnexion
          </Button>
          <span>
            {user?.name && (
              <p style={{ fontSize: "0.9em", lineHeight: "0.9em" }}>
                {user.name}
              </p>
            )}
            {user?.role && (
              <p style={{ fontSize: "0.9em" }}>
                {{
                  "registry.admin": "Admin Registre",
                  "operator.admin": "Admin Opérateur",
                  "territory.admin": "Admin Territoire",
                }[user.role] ?? user.role}
              </p>
            )}
          </span>
        </>
      )}
    </>
  );
}

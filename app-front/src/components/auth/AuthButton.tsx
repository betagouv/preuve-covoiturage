"use client";
import { Config } from "@/config";
import { labelRole } from "@/helpers/auth";
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
              href: "/administration",
            }}
          >
            <div style={{ display: "block" }}>
              <div>{user?.name}</div>
              <div>{labelRole(user?.role ?? "")}</div>
            </div>
          </Button>
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
        </>
      )}
    </>
  );
}

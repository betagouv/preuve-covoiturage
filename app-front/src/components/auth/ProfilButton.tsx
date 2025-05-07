"use client";
import { labelRole } from "@/helpers/auth";
import { useAuth } from "@/providers/AuthProvider";
import Button from "@codegouvfr/react-dsfr/Button";

export function ProfilButton() {
  const { isAuth, user } = useAuth();

  return (
    <>
      {isAuth && (
        <>
          <Button
            iconId="fr-icon-account-fill"
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
        </>
      )}
    </>
  );
}

"use client";
import { useAuth } from "@/providers/AuthProvider";
import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import CampaignsTable from "../tables/CampaignsTable";

export default function TabCampaigns() {
  const { user } = useAuth();
  return (
    <>
      <Alert
        title={"Important"}
        severity="info"
        description={
          <p>
            Les données présentées ci-dessous sont limitées au périmètre
            géographique des campagnes d’incitations financières.
          </p>
        }
      />
      {user && (
        <div className={fr.cx("fr-mt-4w")}>
          <CampaignsTable
            title={`Campagnes d'incitation`}
            territoryId={user?.territory_id}
            operatorId={user?.operator_id}
          />
        </div>
      )}
    </>
  );
}

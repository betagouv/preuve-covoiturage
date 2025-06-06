"use client";
import SelectTerritory from "@/components/common/SelectTerritory";
import SelectTerritoryByOperator from "@/components/common/SelectTerritoryByOperator";
import { useAuth } from "@/providers/AuthProvider";
import CampaignsTable from "../tables/CampaignsTable";

export default function TabCampaigns() {
  const { user, simulate, onChangeTerritory } = useAuth();
  return (
    <>
      {user && (
        <>
          {user.role === "registry.admin" && simulate === false && (
            <SelectTerritory
              defaultValue={user.territory_id}
              onChange={onChangeTerritory}
            />
          )}
          {user.operator_id && (
            <SelectTerritoryByOperator
              defaultValue={user.territory_id}
              onChange={onChangeTerritory}
            />
          )}
          {user.territory_id && (
            <CampaignsTable
              title={`Campagnes d'incitation`}
              territoryId={user.territory_id}
              operatorId={user.operator_id ?? null}
            />
          )}
        </>
      )}
    </>
  );
}

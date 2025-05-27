"use client";
import SelectTerritory from "@/components/common/SelectTerritory";
import { useAuth } from "@/providers/AuthProvider";
import CampaignsTable from "../tables/CampaignsTable";

export default function TabCampaigns() {
  const { user, onChangeTerritory } = useAuth();
  const territoryId = user?.territory_id ?? user?.selected_terrritory_id;
  return (
    <>
      {user?.role === "registry.admin" ||
        (user?.role === "operator.admin" && (
          <SelectTerritory
            defaultValue={territoryId}
            onChange={onChangeTerritory}
          />
        ))}
      {territoryId && (
        <CampaignsTable
          title={`Campagnes d'incitation`}
          territoryId={territoryId}
        />
      )}
    </>
  );
}

"use client";
import SelectTerritory from "@/components/common/SelectTerritory";
import { useAuth } from "@/providers/AuthProvider";
import { useState } from "react";
import JourneysGraph from "../graphs/JourneysGraph";
import OperatorsGraph from "../graphs/OperatorsGraph";

export default function TabBref() {
  const { user } = useAuth();
  const [territoryId, setTerritoryId] = useState<number>(
    user?.territory_id ?? 1,
  );
  const onChangeTerritory = (id?: number) => {
    setTerritoryId(id ?? 1);
  };
  return (
    <>
      {user?.role === "registry.admin" && (
        <SelectTerritory
          defaultValue={territoryId}
          onChange={onChangeTerritory}
        />
      )}
      <JourneysGraph title="Evolution des trajets" territoryId={territoryId} />

      {["operator.admin", "operator.user"].includes(user?.role ?? "") ===
        false &&
        user?.operator_id === undefined && (
          <OperatorsGraph
            title="Evolution des trajets par opérateurs"
            territoryId={territoryId}
          />
        )}
    </>
  );
}

"use client";
import SelectTerritory from "@/components/common/SelectTerritory";
import { useAuth } from "@/providers/AuthProvider";
import JourneysGraph from "../graphs/JourneysGraph";
import OperatorsGraph from "../graphs/OperatorsGraph";

export default function TabBref() {
  const { user, onChangeTerritory } = useAuth();
  const territoryId = user?.territory_id;
  return (
    <>
      {user?.role === "registry.admin" && (
        <SelectTerritory
          defaultValue={territoryId}
          onChange={onChangeTerritory}
        />
      )}
      {territoryId && (
        <JourneysGraph
          title="Evolution des trajets"
          territoryId={territoryId}
        />
      )}

      {["operator.admin", "operator.user"].includes(user?.role ?? "") ===
        false &&
        user?.operator_id === undefined &&
        territoryId && (
          <OperatorsGraph
            title="Evolution des trajets par opérateurs"
            territoryId={territoryId}
          />
        )}
    </>
  );
}

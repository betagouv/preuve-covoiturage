"use client";
import SelectTerritory from "@/components/common/SelectTerritory";
import SelectTerritoryByOperator from "@/components/common/SelectTerritoryByOperator";
import { useAuth } from "@/providers/AuthProvider";
import JourneysGraph from "../graphs/JourneysGraph";
import OperatorsGraph from "../graphs/OperatorsGraph";

export default function TabBref() {
  const { user, simulate, onChangeTerritory } = useAuth();
  return (
    <>
      {user && (
        <>
          {user.role === "registry.admin" && simulate === false ? (
            <SelectTerritory
              defaultValue={user.territory_id}
              onChange={onChangeTerritory}
            />
          ) : user.operator_id ? (
            <SelectTerritoryByOperator
              defaultValue={user.territory_id}
              onChange={onChangeTerritory}
            />
          ) : null}
          {user.territory_id && (
            <>
              <JourneysGraph
                title="Evolution des trajets"
                territoryId={user.territory_id}
              />
              {["registry", "territory"].includes(user.role.split(".")[0]) && (
                <OperatorsGraph
                  title="Evolution des trajets par opérateurs"
                  territoryId={user.territory_id}
                />
              )}
            </>
          )}
        </>
      )}
    </>
  );
}

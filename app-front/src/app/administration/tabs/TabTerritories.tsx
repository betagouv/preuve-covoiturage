import { useAuth } from "@/providers/AuthProvider";
import { useState } from "react";
import TerritoriesTable from "../tables/TerritoriesTable";

export default function TabTerritories() {
  const { user } = useAuth();
  const [key, setKey] = useState(0);
  const refresh = () => {
    setKey((prev) => prev + 1); // Change l'état => déclenche un re-render
  };
  return (
    <>
      <TerritoriesTable
        key={key}
        title={`Gestion des territoires`}
        id={user?.territory_id}
        refresh={refresh}
      />
    </>
  );
}

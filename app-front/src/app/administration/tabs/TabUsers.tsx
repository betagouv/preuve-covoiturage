import { useAuth } from "@/providers/AuthProvider";
import { useState } from "react";
import UsersTable from "../tables/UsersTable";

export default function TabUsers() {
  const { user } = useAuth();
  const [key, setKey] = useState(0);
  const refresh = () => {
    setKey((prev) => prev + 1); // Change l'état => déclenche un re-render
  };
  return (
    <>
      <UsersTable
        key={key}
        title={`Gestion des utilisateurs`}
        territoryId={user?.territory_id}
        operatorId={user?.operator_id}
        refresh={refresh}
      />
    </>
  );
}

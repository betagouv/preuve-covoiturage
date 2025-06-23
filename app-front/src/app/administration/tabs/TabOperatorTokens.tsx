import { useAuth } from "@/providers/AuthProvider";
import { useState } from "react";
import OperatorCredentialsTable from "../tables/OperatorCredentialsTable";

export default function TabOperatorCredentials() {
  const { user, simulatedRole } = useAuth();
  const [key, setKey] = useState(0);
  const refresh = () => {
    setKey((prev) => prev + 1);
  };
  return (
    <>
      <OperatorCredentialsTable
        key={key}
        title={`Administration des clés de l'API`}
        operatorId={simulatedRole ? user?.operator_id : undefined}
        refresh={refresh}
      />
    </>
  );
}

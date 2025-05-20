import { useAuth } from "@/providers/AuthProvider";
import { useState } from "react";
import OperatorTokensTable from "../tables/OperatorTokensTable";

export default function TabOperatorTokens() {
  const { user, simulatedRole } = useAuth();
  const [key, setKey] = useState(0);
  const refresh = () => {
    setKey((prev) => prev + 1);
  };
  return (
    <>
      <OperatorTokensTable
        key={key}
        title={`Administration des tokens de l'API`}
        operatorId={simulatedRole ? user?.operator_id : undefined}
        refresh={refresh}
      />
    </>
  );
}

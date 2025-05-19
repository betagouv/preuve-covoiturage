import { useAuth } from "@/providers/AuthProvider";
import { useState } from "react";
import OperatorTokensTable from "../tables/OperatorTokensTabs";

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
        operatorId={simulatedRole ? user?.operator_id : undefined}
        refresh={refresh}
      />
    </>
  );
}

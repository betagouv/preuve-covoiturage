import { useAuth } from "@/providers/AuthProvider";
import { useState } from "react";
import OperatorTokensTable from "../tables/OperatorTokensTabs";

export default function TabOperatorTokens() {
  const { user } = useAuth();
  const [key, setKey] = useState(0);
  const refresh = () => {
    setKey((prev) => prev + 1);
  };
  return (
    <>
      <OperatorTokensTable
        key={key}
        operatorId={user?.operator_id}
        refresh={refresh}
      />
    </>
  );
}

import { useAuth } from "@/providers/AuthProvider";
import OperatorsTable from "../tables/OperatorsTable";

export default function TabOperators() {
  const { user } = useAuth();
  return (
    <>
      <OperatorsTable
        title={`Gestion des opérateurs`}
        id={user?.operator_id ?? null}
      />
    </>
  );
}

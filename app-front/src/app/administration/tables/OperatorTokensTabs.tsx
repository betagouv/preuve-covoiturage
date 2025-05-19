/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { getApiUrl } from "@/helpers/api";
import { useActionsModal } from "@/hooks/useActionsModal";
import { useApi } from "@/hooks/useApi";
import { type OperatorTokenInterface } from "@/interfaces/dataInterface";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Table from "@codegouvfr/react-dsfr/Table";
import { useMemo } from "react";

export default function OperatorTokensTable(props: {
  title: string;
  operatorId?: number;
  refresh: () => void;
}) {
  // const { user } = useAuth();
  const url = useMemo(() => {
    const urlObj = new URL(getApiUrl("v3", "auth/access_tokens"));
    if (props.operatorId) {
      urlObj.searchParams.set("operator_id", props.operatorId.toString());
    }
    return urlObj.toString();
  }, [props.operatorId]);

  const { data } = useApi<OperatorTokenInterface[]>(url);
  const headers = ["Token"];
  const dataTable =
    data?.map((d) => [
      d.token_id,
    ]) ?? [];

  const handleGenerateToken = async () => {
    const urlObj = new URL(getApiUrl("v3", "auth/access_token"));
    if (props.operatorId) {
      urlObj.searchParams.set("operator_id", props.operatorId.toString());
    }
    const response = await fetch(urlObj.toString(), { credentials: "include" });
  }


  return (
    <>
      <h3 className={fr.cx("fr-callout__title")}>{props.title}</h3>
              <>
                <Button
                  iconId="fr-icon-add-circle-line"
                  onClick={handleGenerateToken}
                  title="Ajouter un opérateur"
                  size="small"
                >
                  Ajouter
                </Button>
              </>
      <Table
        data={dataTable}
        headers={headers}
        colorVariant="blue-ecume"
        fixed
      />
      
    </>
  );
}

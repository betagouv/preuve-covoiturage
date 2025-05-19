import { getApiUrl } from "@/helpers/api";
import { useApi } from "@/hooks/useApi";
import { type OperatorTokenInterface } from "@/interfaces/dataInterface";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Table from "@codegouvfr/react-dsfr/Table";
import { useMemo } from "react";

export default function OperatorTokensTable(props: {
  operatorId?: number;
  refresh: () => void;
}) {
  const addOperatorIdQueryParamIfPresent = (
    urlObj: URL,
    operatorId?: number,
  ) => {
    if (operatorId) {
      urlObj.searchParams.set("operator_id", operatorId.toString());
    }
  };

  const url = useMemo(() => {
    const urlObj = new URL(getApiUrl("v3", "auth/access_tokens"));
    addOperatorIdQueryParamIfPresent(urlObj, props.operatorId);
    return urlObj.toString();
  }, [props.operatorId]);

  const { data } = useApi<OperatorTokenInterface[]>(url);
  const headers = ["Token", "Actions"];
  const dataTable =
    data?.map((d) => [
      d.token_id,
      <ButtonsGroup
        key={d.token_id}
        buttons={[
          {
            children: "supprimer",
            iconId: "fr-icon-delete-bin-line",
            onClick: () => {
              void handleDeleteToken(d.token_id);
            },
          },
        ]}
        buttonsSize="small"
        inlineLayoutWhen="lg and up"
      />,
    ]) ?? [];

  const handleGenerateToken = async () => {
    const urlObj = new URL(getApiUrl("v3", "auth/access_token"));
    addOperatorIdQueryParamIfPresent(urlObj, props.operatorId);
    const response = await fetch(urlObj.toString(), { credentials: "include" });
    // TODO : add pop in to show password a single time
    // TODO : refactor using data refresh only
    props.refresh();
  };

  const handleDeleteToken = async (tokenId: string) => {
    const urlObj = new URL(getApiUrl("v3", "auth/access_token"));
    addOperatorIdQueryParamIfPresent(urlObj, props.operatorId);
    urlObj.searchParams.set("token_id", tokenId);
    const response = await fetch(urlObj.toString(), {
      credentials: "include",
      method: "DELETE",
    });
    // TODO: add pop in to confirm success / error
    // TODO : refactor using data refresh only
    props.refresh();
  };

  return (
    <>
      <h3 className={fr.cx("fr-callout__title")}>
        Administration des tokens de l&apos;API
      </h3>
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

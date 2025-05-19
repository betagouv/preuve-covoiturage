import { getApiUrl } from "@/helpers/api";
import { useApiWithDependency } from "@/hooks/useApi";
import {
  type CreateTokenResponseInterface,
  type OperatorTokenInterface,
} from "@/interfaces/dataInterface";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Table from "@codegouvfr/react-dsfr/Table";
import { useMemo, useState } from "react";
import { ConfirmModal } from "../../../components/common/ConfirmModal";
import Link from "next/link";

const addOperatorIdQueryParamIfPresent = (urlObj: URL, operatorId?: number) => {
  if (operatorId) {
    urlObj.searchParams.set("operator_id", operatorId.toString());
  }
};

export default function OperatorTokensTable(props: { operatorId?: number }) {
  const [createdToken, setCreatedToken] =
    useState<CreateTokenResponseInterface>();
  const [reload, setReload] = useState(0);

  const url = useMemo(() => {
    const urlObj = new URL(getApiUrl("v3", "auth/access_tokens"));
    addOperatorIdQueryParamIfPresent(urlObj, props.operatorId);
    return urlObj.toString();
  }, [props.operatorId]);

  const { data } = useApiWithDependency<OperatorTokenInterface[]>(url, reload);
  const headers = ["Identifiant de la clé", "Actions"];
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
    const response = await fetch(urlObj, { credentials: "include" });
    if (response.status == 200) {
      const createTokenResponse =
        (await response.json()) as CreateTokenResponseInterface;
      setCreatedToken(createTokenResponse);
    }
    // TODO : add error handling
  };

  const handleDeleteToken = async (tokenId: string) => {
    const urlObj = new URL(getApiUrl("v3", "auth/access_token"));
    addOperatorIdQueryParamIfPresent(urlObj, props.operatorId);
    urlObj.searchParams.set("token_id", tokenId);
    const response = await fetch(urlObj, {
      credentials: "include",
      method: "DELETE",
    });
    // TODO : add pop in to confirm success / error
    setReload((prev) => prev + 1);
  };

  return (
    <>
      <h3 className={fr.cx("fr-callout__title")}>
        Administration des tokens de l&apos;API
      </h3>
      <p>
        Consulter la documentation de{" "}
        <Link
          href="https://tech.covoiturage.beta.gouv.fr/#topic-connexion-a-l-api"
          target="_blank"
          aria-label={`Ouvrir une nouvelle fenêtre vers la page documentation de l'API du RPC`}
        >
          l&apos;API du RPC
        </Link>
      </p>
      <>
        <Button
          iconId="fr-icon-add-circle-line"
          onClick={handleGenerateToken}
          title="Générer une nouvelle clé d'API"
          size="small"
        >
          Générer
        </Button>
      </>
      <Table
        data={dataTable}
        headers={headers}
        colorVariant="blue-ecume"
        fixed
      />
      <ConfirmModal
        open={!!createdToken}
        title={"Clé secrete"}
        onClose={() => {
          setCreatedToken(undefined);
          setReload((prev) => prev + 1);
        }}
      >
        <p>
          Voici les informations de votre nouvelle clé d&apos;API. Sauvegardez
          la en lieu sur car elle ne pourra plus jamais être consultée :
        </p>
        <div> Identificant : {createdToken?.uuid}</div>
        <div>
          Clé d&apos;API <strong>{createdToken?.password}</strong>
        </div>
      </ConfirmModal>
    </>
  );
}

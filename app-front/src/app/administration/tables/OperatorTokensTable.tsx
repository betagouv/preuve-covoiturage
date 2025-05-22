import { Modal } from "@/components/common/Modal";
import { getApiUrl } from "@/helpers/api";
import { useActionsModal } from "@/hooks/useActionsModal";
import { useApi } from "@/hooks/useApi";
import {
  type CreateTokenResponseInterface,
  type OperatorTokenInterface,
} from "@/interfaces/dataInterface";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Table from "@codegouvfr/react-dsfr/Table";
import Link from "next/link";
import { useMemo, useState } from "react";

const addOperatorIdQueryParamIfPresent = (urlObj: URL, operatorId?: number) => {
  if (operatorId) {
    urlObj.searchParams.set("operator_id", operatorId.toString());
  }
};

export default function OperatorTokensTable(props: {
  title: string;
  operatorId?: number;
  refresh: () => void;
}) {
  const [createdToken, setCreatedToken] =
    useState<CreateTokenResponseInterface>();

  const url = useMemo(() => {
    const urlObj = new URL(getApiUrl("v3", "auth/access_tokens"));
    addOperatorIdQueryParamIfPresent(urlObj, props.operatorId);
    return urlObj.toString();
  }, [props.operatorId]);

  const { data } = useApi<OperatorTokenInterface[]>(url);
  const modal = useActionsModal<OperatorTokenInterface>();
  const headers = ["Identifiant clé", "Actions"];
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
              modal.setCurrentRow(d);
              modal.setOpenModal(true);
              modal.setTypeModal("delete");
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
    } else {
      console.error("Failed to generate token:", response.status);
    }
  };

  const handleDeleteToken = async (tokenId: string) => {
    const urlObj = new URL(getApiUrl("v3", "auth/access_token"));
    addOperatorIdQueryParamIfPresent(urlObj, props.operatorId);
    urlObj.searchParams.set("token_id", tokenId);
    const response = await fetch(urlObj, {
      credentials: "include",
      method: "DELETE",
    });
    if (response.status == 200) {
      setCreatedToken(undefined);
    } else {
      console.error("Failed to delete token:", response.status);
    }
  };

  return (
    <>
      <h3 className={fr.cx("fr-callout__title")}>{props.title}</h3>
      <div className={fr.cx("fr-text--md")}>
        Consulter la documentation de{" "}
        <Link
          href="https://tech.covoiturage.beta.gouv.fr/#topic-connexion-a-l-api"
          target="_blank"
          aria-label={`Ouvrir une nouvelle fenêtre vers la page documentation de l'API du RPC`}
        >
          l&apos;API du RPC
        </Link>
      </div>
      <>
        <Button
          iconId="fr-icon-add-circle-line"
          onClick={() => {
            modal.setOpenModal(true);
            modal.setErrors({});
            modal.setTypeModal("create");
          }}
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
      <Modal
        open={modal.openModal}
        title={`${modal.modalTitle(modal.typeModal)} une clé secrete`}
        cancelButton={false}
        onOpen={async () => {
          if (modal.typeModal === "create") {
            await handleGenerateToken();
          }
        }}
        onClose={() => {
          modal.setOpenModal(false);
          setCreatedToken(undefined);
          props.refresh();
        }}
        onSubmit={async () => {
          if (modal.typeModal === "delete") {
            await handleDeleteToken(modal.currentRow.token_id as string);
          }
          setCreatedToken(undefined);
          props.refresh();
        }}
      >
        {modal.typeModal === "create" && createdToken && (
          <>
            <div className={fr.cx("fr-text--lead")}>
              Voici les informations de votre nouvelle clé d&apos;API.
              Sauvegardez la en la en lieu sur car elle ne pourra plus jamais
              être consultée :
            </div>
            <div className={fr.cx("fr-text--md")}>
              Identifiant : {createdToken?.uuid}
            </div>
            <div className={fr.cx("fr-text--md")}>
              Clé d&apos;API : <strong>{createdToken?.password}</strong>
            </div>
          </>
        )}
        {modal.typeModal === "delete" &&
          `Êtes-vous sûr de vouloir supprimer la clé ${modal.currentRow.token_id as string} ?`}
      </Modal>
    </>
  );
}

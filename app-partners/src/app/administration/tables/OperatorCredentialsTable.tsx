import AlertMessage from "@/components/common/AlertMessage";
import { Modal } from "@/components/common/Modal";
import { getApiUrl } from "@/helpers/api";
import { useActionsModal } from "@/hooks/useActionsModal";
import { apiErrorMessage, parseBody, toUserError, useApi } from "@/hooks/useApi";
import {
  type CreateTokenResponseInterface as Credentials,
  type OperatorTokenInterface,
} from "@/interfaces/dataInterface";
import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Table from "@codegouvfr/react-dsfr/Table";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function OperatorCredentialsTable(props: { title: string; operatorId: number }) {
  const [credentials, setCredentials] = useState<Credentials>();
  const [error, setError] = useState<Error>();
  const [secretVisible, setSecretVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = useMemo(() => {
    const urlObj = new URL(getApiUrl("v3", "auth/credentials"));
    urlObj.searchParams.set("operator_id", props.operatorId.toString());
    return urlObj.toString();
  }, [props.operatorId]);

  const { data, error: listError, refetch } = useApi<OperatorTokenInterface[]>(url);
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

  const handleCreateCredentials = async () => {
    const url = new URL(getApiUrl("v3", "auth/credentials"));
    const init: RequestInit = {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    if (props.operatorId) {
      init.body = JSON.stringify({ operator_id: props.operatorId });
    }

    const response = await fetch(url, init);
    const body = parseBody(await response.text());
    if (response.status !== 201) throw new Error(apiErrorMessage(response.status, body));
    setSecretVisible(false);
    setCopied(false);
    setCredentials(body as Credentials);
  };

  const copySecret = async () => {
    if (!credentials) return;
    try {
      await navigator.clipboard.writeText(credentials.secret_key);
      setCopied(true);
    } catch {
      setError(new Error("Copie impossible : affichez la clé et copiez-la manuellement."));
    }
  };

  const handleDeleteCredentials = async (tokenId: string) => {
    const url = new URL(getApiUrl("v3", "auth/credentials"));
    url.searchParams.set("token_id", tokenId);
    if (props.operatorId) url.searchParams.set("operator_id", props.operatorId?.toString());

    const response = await fetch(url, {
      credentials: "include",
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (response.status !== 204) throw new Error(apiErrorMessage(response.status, parseBody(await response.text())));
  };

  return (
    <>
      {error && (
        <AlertMessage
          title="Une erreur s'est produite"
          message={error.message}
          typeAlert="error"
          onClose={() => setError(undefined)}
        />
      )}
      <h3 className={fr.cx("fr-callout__title")}>{props.title}</h3>
      {listError && (
        <Alert
          severity="error"
          title="Une erreur s'est produite"
          description={listError.message}
          className={fr.cx("fr-mb-2w")}
        />
      )}
      <div className={fr.cx("fr-text--md")}>
        <Link
          href="https://tech.covoiturage.beta.gouv.fr/#topic-connexion-a-l-api"
          target="_blank"
          aria-label={`Ouvrir une nouvelle fenêtre vers la documentation technique`}
        >
          Consulter la documentation technique
        </Link>
      </div>
      <>
        <Button
          iconId="fr-icon-add-circle-line"
          onClick={() => {
            setCredentials(undefined);
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
      {/* La clé n'est créée qu'à la validation (chaque ouverture de modale en créait une) et reste
          affichée sur la page tant qu'on ne la masque pas : elle n'est montrée qu'une seule fois. */}
      {credentials && (
        <Alert
          severity="success"
          title="Nouvelle clé d'API"
          className={fr.cx("fr-my-2w")}
          closable
          onClose={() => setCredentials(undefined)}
          description={
            <>
              <p>access_key</p>
              <code className="codeblock">{credentials.access_key}</code>
              <p className={fr.cx("fr-mt-2w")}>secret_key</p>
              {/* Masquée par défaut : l'écran peut être partagé ou capturé. */}
              <code className="codeblock" aria-label={secretVisible ? undefined : "secret_key masquée"}>
                {secretVisible ? credentials.secret_key : "•".repeat(24)}
              </code>
              <ButtonsGroup
                className={fr.cx("fr-mt-1w")}
                buttonsSize="small"
                inlineLayoutWhen="always"
                buttons={[
                  {
                    children: secretVisible ? "Masquer" : "Afficher",
                    iconId: "fr-icon-eye-line",
                    priority: "secondary",
                    nativeButtonProps: { "aria-pressed": secretVisible },
                    onClick: () => setSecretVisible((v) => !v),
                  },
                  {
                    children: copied ? "Copiée" : "Copier",
                    iconId: "fr-icon-clipboard-line",
                    priority: "tertiary",
                    onClick: () => void copySecret(),
                  },
                ]}
              />
              <p className={fr.cx("fr-mt-2w", "fr-text--bold")}>
                Attention, la clé n&apos;est affichée qu&apos;une seule fois.
              </p>
            </>
          }
        />
      )}
      <Table data={dataTable} headers={headers} colorVariant="blue-ecume" />
      <Modal
        open={modal.openModal}
        title={modal.typeModal === "create" ? "Générer une clé d'API" : "Supprimer une clé d'API"}
        onClose={() => modal.setOpenModal(false)}
        onSubmit={async () => {
          try {
            setError(undefined);
            if (modal.typeModal === "create") await handleCreateCredentials();
            if (modal.typeModal === "delete") await handleDeleteCredentials(modal.currentRow.token_id as string);
          } catch (e) {
            setError(toUserError(e));
          }
          await refetch();
        }}
      >
        {modal.typeModal === "create" && (
          <p>
            Une nouvelle paire d&apos;identifiants va être créée. Les identifiants ne seront affichés qu&apos;une seule
            fois.
          </p>
        )}
        {modal.typeModal === "delete" && (
          <>
            <p>Êtes-vous sûr de vouloir supprimer la clé&nbsp;?</p>
            <code className="codeblock">{modal.currentRow.token_id as string}</code>
          </>
        )}
      </Modal>
    </>
  );
}

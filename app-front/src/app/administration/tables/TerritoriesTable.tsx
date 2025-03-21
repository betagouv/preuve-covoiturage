/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { Modal } from "@/components/common/Modal";
import Pagination from "@/components/common/Pagination";
import { getApiUrl } from "@/helpers/api";
import { enumTypes, labelType } from "@/helpers/auth";
import { useActionsModal } from "@/hooks/useActionsModal";
import { useApi } from "@/hooks/useApi";
import { type TerritoriesInterface } from "@/interfaces/dataInterface";
import { useAuth } from "@/providers/AuthProvider";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import Table from "@codegouvfr/react-dsfr/Table";
import { useMemo, useState } from "react";
import { z } from "zod";

export default function TerritoriesTable(props: {
  title: string;
  id?: number;
  refresh: () => void;
}) {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const modal = useActionsModal<TerritoriesInterface["data"][0]>();
  const onChangePage = (id: number) => {
    setCurrentPage(id);
  };
  const url = useMemo(() => {
    const urlObj = new URL(getApiUrl("v3", "dashboard/territories"));
    if (props.id) {
      urlObj.searchParams.set("id", props.id.toString());
    }
    if (currentPage !== 1) {
      urlObj.searchParams.set("page", currentPage.toString());
    }
    return urlObj.toString();
  }, [props.id, currentPage]);
  const { data } = useApi<TerritoriesInterface>(url);
  const totalPages = data?.meta.totalPages ?? 1;
  const headers = ["Identifiant", "Nom", "Type", "Siret", "Actions"];
  const dataTable =
    data?.data?.map((d) => [
      d.id,
      d.name,
      labelType(d.type ?? ""),
      d.siret,
      <ButtonsGroup
        key={d.id}
        buttons={[
          {
            children: "modifier",
            iconId: "fr-icon-refresh-line",
            priority: "secondary",
            onClick: () => {
              modal.setCurrentRow(d);
              modal.setErrors({});
              modal.setOpenModal(true);
              modal.setTypeModal("update");
            },
          },
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
  const formSchema = z.object({
    name: z
      .string()
      .min(3, { message: "Le nom doit contenir au moins 3 caractères" }),
    siret: z
      .string()
      .regex(/^\d{14}$/, { message: "Le SIRET doit contenir 14 chiffres" }),
  });

  return (
    <>
      <h3 className={fr.cx("fr-callout__title")}>{props.title}</h3>
      {user?.role === "registry.admin" && (
        <>
          <Button
            iconId="fr-icon-add-circle-line"
            onClick={() => {
              modal.setCurrentRow({ name: "", type: "", siret: "" });
              modal.setOpenModal(true);
              modal.setErrors({});
              modal.setTypeModal("create");
            }}
            title="Ajouter un territoire"
            size="small"
          >
            Ajouter
          </Button>
        </>
      )}
      <Table
        data={dataTable}
        headers={headers}
        colorVariant="blue-ecume"
        fixed
      />
      <Pagination
        count={totalPages}
        defaultPage={currentPage}
        onChange={onChangePage}
      />
      <Modal
        open={modal.openModal}
        title={modal.modalTitle(modal.typeModal)}
        onClose={() => modal.setOpenModal(false)}
        onSubmit={async () => {
          await modal.submitModal("dashboard/territory", formSchema);
          props.refresh();
        }}
      >
        <>
          {(modal.typeModal === "update" || modal.typeModal === "create") && (
            <>
              <Input
                label="Nom du territoire"
                state={modal.errors?.name ? "error" : "default"}
                stateRelatedMessage={modal.errors?.name ?? ""}
                nativeInputProps={{
                  type: "text",
                  value: (modal.currentRow.name as string) ?? "",
                  onChange: (e) =>
                    modal.validateInputChange(
                      formSchema,
                      "name",
                      e.target.value,
                    ),
                }}
              />
              <Select
                label="Type"
                nativeSelectProps={{
                  value: (modal.currentRow.type as string) ?? "",
                  onChange: (e) =>
                    modal.validateInputChange(
                      formSchema,
                      "type",
                      e.target.value,
                    ),
                }}
              >
                <option value="" disabled hidden>
                  Selectionnez un type
                </option>
                {enumTypes?.map((r: string, i: number) => (
                  <option key={i} value={r}>
                    {labelType(r)}
                  </option>
                ))}
              </Select>
              <Input
                label="Siret"
                state={modal.errors?.siret ? "error" : "default"}
                stateRelatedMessage={modal.errors?.siret ?? ""}
                nativeInputProps={{
                  type: "text",
                  value: (modal.currentRow.siret as string) ?? "",
                  onChange: (e) =>
                    modal.validateInputChange(
                      formSchema,
                      "siret",
                      e.target.value,
                    ),
                }}
              />
            </>
          )}
          {modal.typeModal === "delete" &&
            `Êtes-vous sûr de vouloir supprimer le territoire ${modal.currentRow?.name} ?`}
        </>
      </Modal>
    </>
  );
}

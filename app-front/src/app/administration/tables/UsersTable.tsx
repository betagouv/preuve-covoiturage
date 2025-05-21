/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { Modal } from "@/components/common/Modal";
import Pagination from "@/components/common/Pagination";
import { getApiUrl } from "@/helpers/api";
import { enumRoles, getRolesList, labelRole } from "@/helpers/auth";
import { useActionsModal } from "@/hooks/useActionsModal";
import { useApi } from "@/hooks/useApi";
import {
  type OperatorsInterface,
  type TerritoriesInterface,
  type UsersInterface,
} from "@/interfaces/dataInterface";
import { useAuth } from "@/providers/AuthProvider";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import Table from "@codegouvfr/react-dsfr/Table";
import { useMemo, useState } from "react";
import { z } from "zod";

export default function UsersTable(props: {
  title: string;
  territoryId?: number;
  operatorId?: number;
  refresh: () => void;
}) {
  const { user, simulatedRole } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const modal = useActionsModal<UsersInterface["data"][0]>();
  const onChangePage = (id: number) => {
    setCurrentPage(id);
  };
  const url = useMemo(() => {
    const urlObj = new URL(getApiUrl("v3", "dashboard/users"));
    if (props.territoryId) {
      urlObj.searchParams.set("territory_id", props.territoryId.toString());
    } else if (props.operatorId) {
      urlObj.searchParams.set("operator_id", props.operatorId.toString());
    }
    if (currentPage !== 1) {
      urlObj.searchParams.set("page", currentPage.toString());
    }
    return urlObj.toString();
  }, [props.territoryId, props.operatorId, currentPage]);

  const { data } = useApi<UsersInterface>(url);
  const totalPages = data?.meta.totalPages ?? 1;

  const headers = [
    "Identifiant",
    "Rôle",
    "Prénom",
    "Nom",
    "Adresse mail",
    "Opérateur",
    "Territoire",
    "Actions",
  ];
  const operatorsApiUrl = getApiUrl("v3", `dashboard/operators`);
  const { data: operatorsData, refetch: refetchOperators } =
    useApi<OperatorsInterface>(operatorsApiUrl);
  const operatorsList = () => {
    if (user?.operator_id) {
      return [
        operatorsData?.data.find((t) => t.id === user?.operator_id),
      ] as OperatorsInterface["data"];
    }
    return operatorsData?.data ?? [];
  };
  const territoriesApiUrl = getApiUrl("v3", `dashboard/territories`);
  const { data: territoriesData, refetch: refetchTerritories } =
    useApi<TerritoriesInterface>(territoriesApiUrl);
  const territoriesList = () => {
    if (user?.territory_id) {
      return [
        territoriesData?.data.find((t) => t._id === user?.territory_id),
      ] as TerritoriesInterface["data"];
    }
    return territoriesData?.data ?? [];
  };

  const dataTable =
    data?.data?.map((d) => [
      d.id,
      labelRole(d.role),
      d.firstname,
      d.lastname,
      d.email,
      operatorsList().find((o) => o?.id === d.operator_id)?.name,
      territoriesList().find((t) => t?._id === d.territory_id)?.name,
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
    firstname: z
      .string()
      .min(3, { message: "Le prénom doit contenir au moins 3 caractères" }),
    lastname: z
      .string()
      .min(3, { message: "Le nom doit contenir au moins 3 caractères" }),
    email: z.string().email({ message: `L'adresse mail n'est pas valide` }),
    operator_id: z
      .number({ message: "L'identifiant n'est pas un nombre" })
      .optional(),
    territory_id: z
      .number({ message: "L'identifiant n'est pas un nombre" })
      .optional(),
    role: z.enum(enumRoles, { message: "Le rôle n'est pas valide" }),
  });
  const roleList = () => {
    if (simulatedRole) {
      if (user?.territory_id) {
        return getRolesList("territory.admin");
      }
      if (user?.operator_id) {
        return getRolesList("operator.admin");
      }
    }
    return getRolesList(user?.role ?? "anonymous");
  };
  return (
    <>
      <h3 className={fr.cx("fr-callout__title")}>{props.title}</h3>
      {user?.role.split(".")[1] === "admin" && (
        <>
          <Button
            iconId="fr-icon-add-circle-line"
            onClick={() => {
              modal.setCurrentRow({
                firstname: "",
                lastname: "",
                email: "",
                operator_id: user?.operator_id ?? undefined,
                territory_id: user?.territory_id ?? undefined,
                role: `${user?.role.split(".")[0]}.user`,
              });
              modal.setOpenModal(true);
              modal.setErrors({});
              modal.setTypeModal("create");
            }}
            title="Ajouter un utilisateur"
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
        onOpen={async () => {
          if (modal.typeModal === "update" || modal.typeModal === "create") {
            await refetchOperators();
            await refetchTerritories();
          }
        }}
        onClose={() => modal.setOpenModal(false)}
        onSubmit={async () => {
          await modal.submitModal("dashboard/user", formSchema);
          props.refresh();
        }}
      >
        <>
          {(modal.typeModal === "update" || modal.typeModal === "create") && (
            <>
              <Input
                label="Prénom"
                state={modal.errors?.firstname ? "error" : "default"}
                stateRelatedMessage={modal.errors?.firstname ?? ""}
                nativeInputProps={{
                  type: "text",
                  value: (modal.currentRow.firstname as string) ?? "",
                  onChange: (e) =>
                    modal.validateInputChange(
                      formSchema,
                      "firstname",
                      e.target.value,
                    ),
                }}
              />
              <Input
                label="Nom"
                state={modal.errors?.lastname ? "error" : "default"}
                stateRelatedMessage={modal.errors?.lastname ?? ""}
                nativeInputProps={{
                  type: "text",
                  value: (modal.currentRow.lastname as string) ?? "",
                  onChange: (e) =>
                    modal.validateInputChange(
                      formSchema,
                      "lastname",
                      e.target.value,
                    ),
                }}
              />
              <Input
                label="Adresse mail"
                state={modal.errors?.email ? "error" : "default"}
                stateRelatedMessage={modal.errors?.email ?? ""}
                nativeInputProps={{
                  type: "text",
                  value: (modal.currentRow.email as string) ?? "",
                  onChange: (e) =>
                    modal.validateInputChange(
                      formSchema,
                      "email",
                      e.target.value,
                    ),
                }}
              />
              <Select
                label="Rôle"
                nativeSelectProps={{
                  value: (modal.typeModal === "update"
                    ? modal.currentRow.role
                    : (user?.role ?? "")) as string,
                  onChange: (e) =>
                    modal.validateInputChange(
                      formSchema,
                      "role",
                      e.target.value,
                    ),
                }}
              >
                {roleList().map((r: string, i: number) => (
                  <option key={i} value={r}>
                    {labelRole(r)}
                  </option>
                ))}
              </Select>
              {((user?.role === "registry.admin" &&
                !user?.operator_id &&
                !user?.territory_id) ||
                user?.operator_id) && (
                <Select
                  label="Opérateur"
                  nativeSelectProps={{
                    value:
                      (modal.currentRow.operator_id as number) ?? undefined,
                    onChange: (e) =>
                      modal.validateInputChange(
                        formSchema,
                        "operator_id",
                        e.target.value,
                      ),
                  }}
                >
                  {user?.role === "registry.admin" && (
                    <option value={undefined}>aucun</option>
                  )}
                  {operatorsList().map((o, i) => (
                    <option key={i} value={o?.id}>
                      {o?.name}
                    </option>
                  ))}
                </Select>
              )}
              {((user?.role === "registry.admin" &&
                !user?.operator_id &&
                !user?.territory_id) ||
                user?.territory_id) && (
                <Select
                  label="Territoire"
                  nativeSelectProps={{
                    value:
                      (modal.currentRow.territory_id as number) ?? undefined,
                    onChange: (e) =>
                      modal.validateInputChange(
                        formSchema,
                        "territory_id",
                        e.target.value,
                      ),
                  }}
                >
                  {user?.role === "registry.admin" && (
                    <option value={undefined}>aucun</option>
                  )}
                  {territoriesList().map((t, i) => (
                    <option key={i} value={t?._id}>
                      {t?.name}
                    </option>
                  ))}
                </Select>
              )}
            </>
          )}
          {modal.typeModal === "delete" &&
            `Êtes-vous sûr de vouloir supprimer l'utilisateur ${modal.currentRow?.firstname} ${modal.currentRow?.lastname} ?`}
        </>
      </Modal>
    </>
  );
}

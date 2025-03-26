/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { Modal } from "@/components/common/Modal";
import Pagination from "@/components/common/Pagination";
import { getApiUrl } from "@/helpers/api";
import { formatErrors } from "@/hooks/useActionsModal";
import { useApi } from "@/hooks/useApi";
import {
  type Company,
  type TerritoriesInterface,
  type Territory,
  type TerritorySelectorsInterface,
} from "@/interfaces/dataInterface";
import { useAuth } from "@/providers/AuthProvider";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Input from "@codegouvfr/react-dsfr/Input";
import Table from "@codegouvfr/react-dsfr/Table";
import { useCallback, useMemo, useState } from "react";
import { z, ZodError } from "zod";
import { Config } from "../../../config";

const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Le nom doit contenir au moins 3 caractères" }),
  siret: z
    .string()
    .regex(/^\d{14}$/, { message: "Le SIRET doit contenir 14 chiffres" }),
});

export default function TerritoriesTable(props: {
  title: string;
  id?: number;
  refresh: () => void;
}) {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);

  // useModal
  const [openModal, setOpenModal] = useState(false);
  const [typeModal, setTypeModal] = useState<"delete" | "create">("create");
  const [currentRow, setCurrentRow] = useState<Territory>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selector, setSelector] = useState<TerritorySelectorsInterface>();
  const [submitData, setSubmitData] = useState<unknown>();
  const [submitError, setSubmitError] = useState<Error>();
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  const modalTitle = (type: "delete" | "create") => {
    switch (type) {
      case "delete":
        return "Supprimer";
      case "create":
        return "Ajouter";
      default:
        return "Action";
    }
  };

  const validateInputChange = (
    value: Territory,
  ): Record<string, string> | null => {
    try {
      formSchema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        return formatErrors(error.flatten().fieldErrors);
      }
    }
    return null;
  };

  const fetchCompany = async (siret: string): Promise<Response> => {
    return fetch(
      `${Config.get<string>("auth.domain")}/rpc?methods=company:fetch`,
      {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "company:fetch",
          params: siret,
          id: 1,
        }),
      },
    );
  };

  const submitModal = useCallback(
    async (url: string) => {
      try {
        if (typeModal !== "delete") {
          const result = formSchema.safeParse(currentRow);
          if (!result.success) {
            const errors = result.error.flatten().fieldErrors;
            setErrors(formatErrors(errors));
          }
        }
        setSubmitLoading(true);
        const request = {
          url: "",
          params: {
            method: "",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          } as RequestInit,
        };
        switch (typeModal) {
          case "delete":
            request.url = getApiUrl("v3", `${url}/${currentRow?._id}`);
            request.params.method = "DELETE";
            break;
          case "create":
            const companyResponse: Response = await fetchCompany(
              currentRow!.siret,
            );
            if (companyResponse.ok) {
              const companyBody = (await companyResponse.json()) as Company;
              request.url = getApiUrl("v3", url);
              request.params.method = "POST";
              request.params.body = JSON.stringify({
                ...currentRow,
                company_id: companyBody.result.data._id,
                selector: selector,
              });
            } else {
              throw new Error("Aucune entreprise trouvée pour ce siret");
            }
            break;
        }
        const response = await fetch(request.url, request.params);
        const res = await response.json();
        if (!response.ok) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          throw new Error(res?.message ?? "Une erreur est survenue");
        }
        setSubmitData(res);
        return;
      } catch (e) {
        setSubmitError(e as Error);
        throw e;
      } finally {
        setSubmitLoading(false);
      }
    },
    [currentRow, typeModal],
  );
  // useModal

  const onChangePage = (page: number) => {
    setCurrentPage(page);
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
  const dataTable =
    data?.data?.map((d) => [
      d._id,
      d.name,
      d.siret,
      <ButtonsGroup
        key={d._id}
        buttons={[
          {
            children: "supprimer",
            iconId: "fr-icon-delete-bin-line",
            onClick: () => {
              setCurrentRow(d);
              setOpenModal(true);
              setTypeModal("delete");
            },
          },
        ]}
        buttonsSize="small"
        inlineLayoutWhen="lg and up"
      />,
    ]) ?? [];

  return (
    <>
      <h3 className={fr.cx("fr-callout__title")}>{props.title}</h3>
      {user?.role === "registry.admin" && (
        <>
          <Button
            iconId="fr-icon-add-circle-line"
            onClick={() => {
              setCurrentRow({ name: "", siret: "" });
              setOpenModal(true);
              setTypeModal("create");
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
        headers={["Identifiant", "Nom", "Siret", "Actions"]}
        colorVariant="blue-ecume"
        fixed
      />
      <Pagination
        count={totalPages}
        defaultPage={currentPage}
        onChange={onChangePage}
      />
      <Modal
        open={openModal}
        title={modalTitle(typeModal)}
        onClose={() => setOpenModal(false)}
        onSubmit={async () => {
          await submitModal("dashboard/territory");
          props.refresh();
        }}
      >
        <>
          {typeModal === "create" && (
            <>
              <Input
                label="Siret"
                state={errors?.siret ? "error" : "default"}
                stateRelatedMessage={errors?.siret ?? ""}
                nativeInputProps={{
                  type: "text",
                  value: currentRow?.siret ?? "",
                  onChange: (e) => {
                    const updatedRow = {
                      ...currentRow,
                      siret: e.target.value,
                    } as Territory;
                    const schemaErrors = validateInputChange(updatedRow);
                    if (schemaErrors) {
                      setErrors(schemaErrors);
                    } else {
                      setErrors({});
                    }
                    if (!!schemaErrors && !!!schemaErrors?.siret) {
                      void (async () => {
                        const geoResponse: Response = await fetch(
                          `${Config.get<string>("auth.domain")}/rpc?methods=territory:findGeoBySiren`,
                          {
                            credentials: "include",
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              jsonrpc: "2.0",
                              method: "territory:findGeoBySiren",
                              params: { siren: e.target.value.substring(0, 9) },
                              id: 1,
                            }),
                          },
                        );
                        if (geoResponse.ok) {
                          const body = await geoResponse.json();
                          if (!!body.result.data.aom_siren) {
                            updatedRow.name = body.result.data.aom_name;
                            setSelector({
                              aom: [body.result.data.aom_siren],
                            });
                            setCurrentRow(updatedRow);
                            const schemaErrors =
                              validateInputChange(updatedRow);
                            if (schemaErrors) {
                              setErrors(schemaErrors);
                            } else {
                              setErrors({});
                            }
                          }
                        }
                      })();
                    } else {
                      setCurrentRow(updatedRow);
                    }
                  },
                }}
              />
              <Input
                label="Nom du territoire"
                state={errors?.name ? "error" : "default"}
                stateRelatedMessage={errors?.name ?? ""}
                nativeInputProps={{
                  type: "text",
                  value: currentRow?.name ?? "",
                  onChange: (e) => {
                    const updatedRow = {
                      ...currentRow,
                      name: e.target.value,
                    } as Territory;
                    const schemaErrors = validateInputChange(updatedRow);
                    if (schemaErrors) {
                      setErrors(schemaErrors);
                    } else {
                      setErrors({});
                    }
                    setCurrentRow(updatedRow);
                  },
                }}
              />
            </>
          )}
          {typeModal === "delete" &&
            `Êtes-vous sûr de vouloir supprimer le territoire ${currentRow?.name} ?`}
        </>
      </Modal>
    </>
  );
}

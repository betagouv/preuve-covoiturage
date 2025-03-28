/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Modal } from "@/components/common/Modal";
import Input from "@codegouvfr/react-dsfr/Input";
import { useState } from "react";
import { z, ZodError } from "zod";
import { Config } from "../../../../config";
import { getApiUrl } from "../../../../helpers/api";
import { formatErrors } from "../../../../hooks/useActionsModal";
import {
  type Company,
  type Territory,
  type TerritorySelectorsInterface,
} from "../../../../interfaces/dataInterface";
import { type ModalState } from "../TerritoriesTable";

const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Le nom doit contenir au moins 3 caractères" }),
  siret: z
    .string()
    .regex(/^\d{14}$/, { message: "Le SIRET doit contenir 14 chiffres" }),
});

interface TerritorModalProps {
  modal: ModalState;
  closeModalCallback: () => void;
  refreshCallBack: () => void;
}

export default function TerritoryModal({
  modal,
  closeModalCallback,
  refreshCallBack,
}: TerritorModalProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selector, setSelector] = useState<TerritorySelectorsInterface>();
  const [territory, setTerritory] = useState<Territory>(modal.territory);

  const modalTitle = (type: "delete" | "create") => {
    switch (type) {
      case "delete":
        return "Supprimer";
      case "create":
        return "Ajouter";
    }
  };

  const validateFormAndToggleError = (
    value: Territory,
  ): Record<string, string> | null => {
    try {
      formSchema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const schemaError = formatErrors(error.flatten().fieldErrors);
        setErrors(schemaError);
        return schemaError;
      }
    }
    setErrors({});
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

  const findGeoBySiren = async (siret: string): Promise<Response> => {
    return await fetch(
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
          params: { siren: siret.substring(0, 9) },
          id: 1,
        }),
      },
    );
  };

  const submitModal = async (url: string) => {
    try {
      if (modal.type === "create") {
        const result = formSchema.safeParse(territory);
        if (!result.success) {
          const errors = result.error.flatten().fieldErrors;
          setErrors(formatErrors(errors));
        }
      }
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
      switch (modal.type) {
        case "delete":
          request.url = getApiUrl("v3", `${url}/${modal.territory?._id}`);
          request.params.method = "DELETE";
          break;
        case "create":
          const companyResponse: Response = await fetchCompany(territory.siret);
          if (companyResponse.ok) {
            const companyBody = (await companyResponse.json()) as Company;
            request.url = getApiUrl("v3", url);
            request.params.method = "POST";
            request.params.body = JSON.stringify({
              ...territory,
              company_id: companyBody.result.data._id,
              selector: selector,
            });
          } else {
            throw new Error("Aucune entreprise trouvée pour ce siret");
          }
          break;
      }
      const response = await fetch(request.url, request.params);
      if (!response.ok) {
        const res = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        throw new Error(res?.message ?? "Une erreur est survenue");
      }
      refreshCallBack();
      return;
    } catch (e) {
      throw e;
    }
  };

  return (
    <Modal
      open={modal.open}
      title={modalTitle(modal.type)}
      onClose={() => closeModalCallback()}
      onSubmit={async () => {
        await submitModal("dashboard/territory");
      }}
    >
      <>
        {modal.type === "create" && (
          <>
            <Input
              label="Siret"
              state={errors?.siret ? "error" : "default"}
              stateRelatedMessage={errors?.siret ?? ""}
              nativeInputProps={{
                type: "text",
                value: territory?.siret ?? "",
                onChange: (e) => {
                  const updatedRow = {
                    ...territory,
                    siret: e.target.value,
                  } as Territory;
                  const schemaErrors = validateFormAndToggleError(updatedRow);
                  if (!!schemaErrors && !!!schemaErrors?.siret) {
                    void (async () => {
                      const geoResponse: Response = await findGeoBySiren(
                        e.target.value,
                      );
                      if (geoResponse.ok) {
                        const body = await geoResponse.json();
                        if (!!body.result.data.aom_siren) {
                          updatedRow.name = body.result.data.aom_name;
                          setSelector({
                            aom: [body.result.data.aom_siren],
                          });
                          setTerritory(updatedRow);
                          validateFormAndToggleError(updatedRow);
                        }
                      }
                    })();
                  } else {
                    setTerritory(updatedRow);
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
                value: territory?.name ?? "",
                onChange: (e) => {
                  const updatedRow = {
                    ...territory,
                    name: e.target.value,
                  } as Territory;
                  validateFormAndToggleError(updatedRow);
                  setTerritory(updatedRow);
                },
              }}
            />
          </>
        )}
        {modal.type === "delete" &&
          `Êtes-vous sûr de vouloir supprimer le territoire ${territory?.name} ?`}
      </>
    </Modal>
  );
}

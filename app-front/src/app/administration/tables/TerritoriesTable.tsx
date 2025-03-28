/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import Pagination from "@/components/common/Pagination";
import { getApiUrl } from "@/helpers/api";
import { useApi } from "@/hooks/useApi";
import {
  type TerritoriesInterface,
  type Territory,
} from "@/interfaces/dataInterface";
import { useAuth } from "@/providers/AuthProvider";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Table from "@codegouvfr/react-dsfr/Table";
import { useMemo, useState } from "react";
import TerritoryModal from "./modals/TerritoryModal";

interface TerritoriesTableProps {
  title: string;
  id?: number;
  refresh: () => void;
}

export interface ModalState {
  open: boolean;
  type: "delete" | "create";
  territory: Territory;
}

export default function TerritoriesTable(props: TerritoriesTableProps) {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);

  const [modal, setModal] = useState<ModalState>({
    open: false,
    type: "create",
    territory: {
      name: "",
      siret: "",
    },
  });

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
              setModal({
                territory: d,
                open: true,
                type: "delete",
              });
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
              setModal({
                territory: { name: "", siret: "" },
                open: true,
                type: "create",
              });
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
      <TerritoryModal
        modal={modal}
        closeModalCallback={() =>
          setModal((prev) => ({ ...prev, open: false }))
        }
        refreshCallBack={() => props.refresh()}
      />
    </>
  );
}

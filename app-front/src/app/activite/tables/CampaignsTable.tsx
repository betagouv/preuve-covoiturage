import Pagination from "@/components/common/Pagination";
import Loading from "@/components/layout/Loading";
import { getApiUrl } from "@/helpers/api";
import { useApi } from "@/hooks/useApi";
import type { CampaignsInterface } from "@/interfaces/dataInterface";
import { useAuth } from "@/providers/AuthProvider";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { useMemo, useState } from "react";
import JourneysGraph from "../graphs/JourneysGraph";
import OperatorsGraph from "../graphs/OperatorsGraph";
import ApdfTable from "./ApdfTable";

export default function CampaignsTable(props: {
  title: string;
  territoryId?: number;
  operatorId?: number;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [campaignId, setCampaignId] = useState<number>();
  const { user } = useAuth();
  const onChangePage = (id: number) => {
    setCurrentPage(id);
  };
  const url = useMemo(() => {
    const urlObj = new URL(getApiUrl("v3", "dashboard/campaigns"));
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

  const { data, loading } = useApi<CampaignsInterface>(url);
  const totalPages = data?.meta.totalPages ?? 1;
  const getIcon = (value: string) => {
    return value === "finished" ? (
      <span
        className={fr.cx("ri-close-circle-fill", "fr-badge--error")}
        aria-hidden="true"
      ></span>
    ) : value === "active" ? (
      <span
        className={fr.cx("ri-verified-badge-fill", "fr-badge--success")}
        aria-hidden="true"
      ></span>
    ) : (
      value
    );
  };
  const dataTable =
    data?.data?.map((d, i) => [
      getIcon(d.status),
      d.start_date,
      d.end_date,
      d.territory_name,
      d.name,
      `${Number(d.incentive_sum).toLocaleString()} €`,
      `${Number(d.max_amount).toLocaleString()} €`,
      <Button key={i} size="small" onClick={() => setCampaignId(Number(d.id))}>
        Détails
      </Button>,
    ]) ?? [];

  const headers = [
    "Statut",
    "Date de début",
    "Date de fin",
    "Territoire",
    "Nom de la campagne",
    "Dépense estimée",
    "Budget",
    "",
  ];

  const currentCampaign = data?.data.find((d) => Number(d.id) === campaignId);
  if (loading) return <Loading />;
  return (
    <>
      {!campaignId && (
        <>
          {dataTable.length > 0 ? (
            <>
              <h3 className={fr.cx("fr-callout__title")}>{props.title}</h3>
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
            </>
          ) : (
            <p>Pas de campagnes ...</p>
          )}
        </>
      )}
      {campaignId && currentCampaign && (
        <>
          <h3 className={fr.cx("fr-callout__title")}>
            <a href="#" target="_self" onClick={() => setCampaignId(undefined)}>
              {props.title}
            </a>
            <span className={fr.cx("fr-pl-2v")}>
              &gt; Campagne {currentCampaign.name}
            </span>
          </h3>
          <div className={fr.cx("fr-callout")}>
            <div className={fr.cx("fr-callout__title")}>
              {currentCampaign.territory_name}
            </div>
            <div>
              <b>Nom de la campagne :</b> {currentCampaign.name}
            </div>
            <div>
              <b>Durée de la campagne :</b> Du{" "}
              {new Date(currentCampaign.start_date).toLocaleDateString()} au{" "}
              {new Date(currentCampaign.end_date).toLocaleDateString()}
            </div>
            <div>
              <b>Estimation de la consommation du budget* :</b>{" "}
              {`${Number(currentCampaign.incentive_sum).toLocaleString()} € sur ${Number(currentCampaign.max_amount).toLocaleString()} €`}
            </div>
            <i>
              * A noter que le budget est le montant dédié aux incitations
              uniquement et qu’il s’agit ici d’une estimation de la consommation
              en quasi temps réel.{" "}
            </i>
          </div>
          <JourneysGraph
            title="Evolution des trajets"
            campaignId={campaignId}
          />
          {["registry", "territory"].includes(
            user?.role.split(".")[0] ?? "",
          ) && (
            <OperatorsGraph
              title="Evolution des trajets par opérateurs"
              campaignId={campaignId}
            />
          )}
          <ApdfTable
            title="Fichiers d’appels de fonds recalculés par covoiturage.beta.gouv"
            campaignId={campaignId}
            operatorId={props.operatorId}
          />
        </>
      )}
    </>
  );
}

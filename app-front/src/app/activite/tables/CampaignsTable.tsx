import Pagination from "@/components/common/Pagination";
import { getApiUrl } from "@/helpers/api";
import { useApi } from "@/hooks/useApi";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { useEffect, useState } from "react";
import ApdfTable from "./ApdfTable";

export default function CampaignsTable(props: {
  title: string;
  territoryId: number | null;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [offset, setOffset] = useState([0, 15]);
  const [campaignId, setCampaignId] = useState<number>();
  const resultByPage = 15;

  const onChangePage = (id: number) => {
    setCurrentPage(id);
  };

  const url = getApiUrl("v3", "dashboard/campaigns");
  const { data } = useApi<Record<string, string | number>[]>(
    props.territoryId ? `${url}?territory_id=${props.territoryId}` : url,
  );
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
    data?.map((d, i) => [
      getIcon(d.status as string),
      d.start_date,
      d.end_date,
      d.territory_name,
      d.name,
      `${d.incentive_sum.toLocaleString()} €`,
      `${d.max_amount.toLocaleString()} €`,
      <Button
        key={i}
        size="small"
        onClick={() => setCampaignId(d.id as number)}
      >
        Détails
      </Button>,
    ]) ?? [];

  const countPage = Math.ceil(dataTable.length / resultByPage);

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

  const currentCampaign = data?.find((d) => d.id === campaignId);

  useEffect(() => {
    setOffset([(currentPage - 1) * resultByPage, currentPage * resultByPage]);
  }, [currentPage]);

  return (
    <>
      {!campaignId && (
        <>
          {dataTable.length > 0 ? (
            <>
              <h3 className={fr.cx("fr-callout__title")}>{props.title}</h3>
              <Table
                data={dataTable.slice(offset[0], offset[1])}
                headers={headers}
                colorVariant="blue-ecume"
              />
              <Pagination
                count={countPage}
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
              {`${currentCampaign.incentive_sum.toLocaleString()} € sur ${currentCampaign.max_amount.toLocaleString()} €`}
            </div>
            <i>
              * A noter que le budget est le montant dédié aux incitations
              uniquement et qu’il s’agit ici d’une estimation de la consommation
              en quasi temps réel.{" "}
            </i>
          </div>
          <ApdfTable
            title="Fichiers d’appels de fonds recalculés par covoiturage.beta.gouv"
            campaignId={campaignId}
          />
        </>
      )}
    </>
  );
}

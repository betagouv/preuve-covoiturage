import { Config } from "@/config";
import { getApiUrl } from "@/helpers/api";
import { useApi } from "@/hooks/useApi";
import { fr } from "@codegouvfr/react-dsfr";
import { Download } from "@codegouvfr/react-dsfr/Download";
import Table from "@codegouvfr/react-dsfr/Table";
import { useMemo } from "react";

export default function ApdfTable(props: {
  title: string;
  campaignId: number;
  operatorId: number | null;
}) {
  const url = `${Config.get<string>("auth.domain")}/rpc?methods=apdf:list`;
  const init = useMemo(() => {
    const params = {
      campaign_id: props.campaignId,
      ...(props.operatorId !== null && { operator_id: props.operatorId }),
    };
    return {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "apdf:list",
        params: params,
        id: 1,
      }),
    };
  }, [props.campaignId, props.operatorId]);
  const { data } = useApi<{
    id: number;
    result: { meta: null; data: Record<string, string | number>[] };
    jsonrpc: string;
  }>(url, false, init);
  const headers = [
    "Mois",
    "Opérateur",
    "Trajets",
    "Trajets incités",
    "Montant d'indemnisation",
    "Fichier",
  ];
  const operatorsApiUrl = getApiUrl("v3", `dashboard/operators`);
  const operatorsList = useApi<{ data: Record<string, string | number>[] }>(
    operatorsApiUrl,
  );

  if (!data) return <>Pas d&apos;APDF...</>;

  return (
    <>
      <h3 className={fr.cx("fr-callout__title")}>{props.title}</h3>
      <Table
        data={data.result.data
          .map((d, i) => [
            (d.datetime as string).slice(0, 7),
            (operatorsList.data?.data ?? []).find((o) => o.id === d.operator_id)
              ?.name ?? "inconnu",
            d.trips,
            d.subsidized,
            `${(Number(d.amount) / 100).toLocaleString()} €`,
            <Download
              key={i}
              details={`xlsx - ${(Number(d.size) / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} Ko`}
              label="Télécharger"
              linkProps={{
                href: d.signed_url as string,
              }}
            />,
          ])
          .reverse()}
        headers={headers}
        colorVariant="blue-ecume"
      />
    </>
  );
}

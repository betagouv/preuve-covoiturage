import { getApiUrl } from '@/helpers/api';
import { useApi } from '@/hooks/useApi';
import { fr } from '@codegouvfr/react-dsfr';
import { Download } from "@codegouvfr/react-dsfr/Download";
import Table from '@codegouvfr/react-dsfr/Table';

export default function ApdfTable(props: {title:string, campaignId:number}) {
  const url = getApiUrl('v3', `dashboard/campaign-apdf?campaign_id=${props.campaignId}`);
  const { data } = useApi<Record<string, string | number>[]>(url);
  const headers = [
    'Mois',
    'Opérateur',
    'Trajets',
    'Trajets incités',
    'Montant d\'indemnisation',
    'Fichier',
  ];
  const operatorsApiUrl = getApiUrl("v3", `dashboard/operators`);
  const operatorsList = useApi<Record<string, string | number>[]>(operatorsApiUrl);
  const dataTable = data?.map((d, i) => [
    (d.datetime as string).slice(0,7),
    operatorsList.data!.find(o => o.id === d.operator_id)!.name,
    d.trips,
    d.subsidized,
    `${(Number(d.amount)/100).toLocaleString()} €`,
    <Download
       key={i}
      details={`xlsx - ${(Number(d.size)/1000).toLocaleString('fr-FR',{maximumFractionDigits:1})} Ko`}
      label="Télécharger"
      linkProps={{
        href: d.signed_url as string
      }}
    />
  ]) ?? [];
  return(
    <>
      <h3 className={fr.cx('fr-callout__title')}>{props.title}</h3>
      <Table data={dataTable.reverse()}  headers={headers} colorVariant='blue-ecume'/>
    </>
  );
}
import { Config } from '@/config';
import { useApi } from '@/hooks/useApi';
import { fr } from '@codegouvfr/react-dsfr';
import { Table } from "@codegouvfr/react-dsfr/Table";



export default function CampaignsTable(props: {title:string, territoryId:string | undefined}) {

  const getUrl = () => {
    const host = Config.get<string>("next.public_api_url", "");
    let url = `${host}/v3/dashboard/campaigns/`;
    if (props.territoryId) {
      url = `${url}?territory_id=${props.territoryId}`
    }
    return url;
  };
  const { data } = useApi<Record<string, string | number>[]>(getUrl());
  const dataTable = data?.map(d => [
    d.status,
    d.start_date,
    d.end_date,
    d.territory_name,
    d.name,
    d.incentive_sum,
    d.max_amount,
  ]) ?? []
  const headers = [
    'Statut',
    'Date de début',
    'Date de fin',
    'Territoire',
    'Nom de la campagne',
    'Dépense estimée',
    'Budget'
  ]
  
  return(
    <>
      <h3 className={fr.cx('fr-callout__title')}>{props.title}</h3>
      {dataTable.length > 0 ?
        <Table data={dataTable}  headers={headers}/>
      : <p>Pas de campagne pour ce territoire</p>
      }
      
    </>    
  );
}
import Pagination from '@/components/common/Pagination';
import { Config } from '@/config';
import { useApi } from '@/hooks/useApi';
import { fr } from '@codegouvfr/react-dsfr';
import { Table } from "@codegouvfr/react-dsfr/Table";
import { useEffect, useState } from 'react';



export default function CampaignsTable(props: {title:string, territoryId:string | undefined}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [offset, setOffset] = useState([0,25]);
  const resultByPage = 15;

  const onChangePage = (id:number) => {
    setCurrentPage(id);
  };

  const getUrl = () => {
    const host = Config.get<string>("next.public_api_url", "");
    let url = `${host}/v3/dashboard/campaigns/`;
    if (props.territoryId) {
      url = `${url}?territory_id=${props.territoryId}`
    }
    return url;
  };

  const { data } = useApi<Record<string, string | number>[]>(getUrl());
  const getIcon = (value:string) =>{
   return value === 'finished' ? 
    <span className={fr.cx('fr-icon-error-line','fr-badge--error')} aria-hidden="true"></span>
    : value === 'active' ? 
      <span className={fr.cx('fr-icon-success-line', 'fr-badge--success')} aria-hidden="true"></span>
      : value;
  }
  const dataTable = data?.map(d => [
    getIcon(d.status as string),
    d.start_date,
    d.end_date,
    d.territory_name,
    d.name,
    `${d.incentive_sum.toLocaleString()} €`,
    `${d.max_amount.toLocaleString()} €`,
  ]) ?? [];

  const countPage = Math.ceil(dataTable.length/resultByPage);

  const headers = [
    'Statut',
    'Date de début',
    'Date de fin',
    'Territoire',
    'Nom de la campagne',
    'Dépense estimée',
    'Budget'
  ];
 

  useEffect(() => {
    setOffset([(currentPage - 1)*resultByPage, currentPage*resultByPage])
  }, [currentPage]);
  
  return(
    <>
      <h3 className={fr.cx('fr-callout__title')}>{props.title}</h3>
      {dataTable.length > 0 ?
        <Table data={dataTable.slice(offset[0], offset[1])}  headers={headers} colorVariant='blue-ecume'/>
      : <p>Pas de campagne pour ce territoire</p>
      }
      <Pagination count={countPage} defaultPage={currentPage} onChange={onChangePage}/>      
    </>    
  );
}
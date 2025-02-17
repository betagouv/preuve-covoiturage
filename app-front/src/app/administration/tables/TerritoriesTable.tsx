import Pagination from '@/components/common/Pagination';
import { getApiUrl } from '@/helpers/api';
import { useApi } from '@/hooks/useApi';
import { fr } from '@codegouvfr/react-dsfr';
import Table from '@codegouvfr/react-dsfr/Table';
import { useEffect, useState } from 'react';

export default function TerritoriesTable(props: {title:string, id:number | null}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [offset, setOffset] = useState([0,15]);
  const resultByPage = 15;
  const onChangePage = (id:number) => {
    setCurrentPage(id);
  };
  const url = getApiUrl('v3', `dashboard/territories`);
  const { data } = useApi<Record<string, string | number>[]>(props.id ? `${url}?id=${props.id}` : url);
  const headers = [
    'Identifiant',
    'Nom',
  ];  
  const dataTable = data?.map((d) => [
    d.id,
    d.name,
  ]) ?? [];
  const countPage = Math.ceil(dataTable.length/resultByPage);
  useEffect(() => {
    setOffset([(currentPage - 1)*resultByPage, currentPage*resultByPage])
  }, [currentPage]);
  return(
    <>
      <h3 className={fr.cx('fr-callout__title')}>{props.title}</h3>
      <Table data={dataTable.slice(offset[0], offset[1])}  headers={headers} colorVariant='blue-ecume'/>
      <Pagination count={countPage} defaultPage={currentPage} onChange={onChangePage}/>
    </>
  );
}
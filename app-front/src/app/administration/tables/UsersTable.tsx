import Pagination from '@/components/common/Pagination';
import { getApiUrl } from '@/helpers/api';
import { useApi } from '@/hooks/useApi';
import { fr } from '@codegouvfr/react-dsfr';
import Table from '@codegouvfr/react-dsfr/Table';
import { useEffect, useState } from 'react';

export default function UsersTable(props: {title:string}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [offset, setOffset] = useState([0,15]);
  const resultByPage = 15;
  const onChangePage = (id:number) => {
    setCurrentPage(id);
  };
  const url = getApiUrl('v3', `dashboard/users`);
  const { data } = useApi<Record<string, string | number>[]>(url);
  const headers = [
    'Rôle',
    'Statut',
    'Prénom',
    'Nom',
    'Adresse mail',
    'Opérateur',
    'Territoire'
  ];
  const operatorsApiUrl = getApiUrl("v3", `dashboard/operators`);
  const operatorsList = useApi<Record<string, string | number>[]>(operatorsApiUrl);
  const territoriesApiUrl = getApiUrl("v3", `dashboard/territories`);
  const territoriesList = useApi<Record<string, string | number>[]>(territoriesApiUrl);
  const dataTable = data?.map((d) => [
    d.role,
    d.status,
    d.firstname,
    d.lastname,
    d.email,
    operatorsList.data?.find(o => o.id === d.operator_id)?.name,
    territoriesList.data?.find(o => o.id === d.operator_id)?.name,
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
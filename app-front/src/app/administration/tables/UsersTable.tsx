import Pagination from '@/components/common/Pagination';
import { getApiUrl } from '@/helpers/api';
import { labelRole } from '@/helpers/auth';
import { useApi } from '@/hooks/useApi';
import { OperatorsInterface, TerritoriesInterface, UsersInterface } from '@/interfaces/dataInterface';
import { fr } from '@codegouvfr/react-dsfr';
import Table from '@codegouvfr/react-dsfr/Table';
import { useMemo, useState } from 'react';

export default function UsersTable(props: {title:string, territoryId:number | null, operatorId:number | null}) {
  const [currentPage, setCurrentPage] = useState(1);
  const onChangePage = (id:number) => {
    setCurrentPage(id);
  };
  const url = useMemo(() => {
    const urlObj = new URL(getApiUrl('v3', 'dashboard/users'));
    if (props.territoryId) {
      urlObj.searchParams.set('territory_id', props.territoryId.toString());
    } else if (props.operatorId) {
      urlObj.searchParams.set('operator_id', props.operatorId.toString());
    }
    if (currentPage !== 1) {
      urlObj.searchParams.set('page', currentPage.toString());
    }
    return urlObj.toString();
  }, [props.territoryId, props.operatorId, currentPage]);

  const { data } = useApi<UsersInterface>(url);
  const totalPages = data?.meta.totalPages || 1;  

  const headers = [
    'Rôle',
    'Prénom',
    'Nom',
    'Adresse mail',
    'Opérateur',
    'Territoire'
  ];
  const operatorsApiUrl = getApiUrl("v3", `dashboard/operators`);
  const operatorsList = useApi<OperatorsInterface>(operatorsApiUrl).data?.data;
  const territoriesApiUrl = getApiUrl("v3", `dashboard/territories`);
  const territoriesList = useApi<TerritoriesInterface>(territoriesApiUrl).data?.data;
  const dataTable = data?.data?.map((d) => [
    labelRole(d.role as string),
    d.firstname,
    d.lastname,
    d.email,
    operatorsList?.find(o => o.id === d.operator_id)?.name,
    territoriesList?.find(t => t.id === d.territory_id)?.name,
  ]) ?? [];
  return(
    <>
      <h3 className={fr.cx('fr-callout__title')}>{props.title}</h3>
      <Table data={dataTable}  headers={headers} colorVariant='blue-ecume' fixed/>
      <Pagination count={totalPages} defaultPage={currentPage} onChange={onChangePage}/>
    </>
  );
}
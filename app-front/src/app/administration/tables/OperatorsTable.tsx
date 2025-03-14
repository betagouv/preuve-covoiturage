import Pagination from '@/components/common/Pagination';
import { getApiUrl } from '@/helpers/api';
import { useApi } from '@/hooks/useApi';
import { OperatorsInterface } from '@/interfaces/dataInterface';
import { fr } from '@codegouvfr/react-dsfr';
import Table from '@codegouvfr/react-dsfr/Table';
import { useMemo, useState } from 'react';

export default function OperatorsTable(props: {title:string, id:number | null}) {
  const [currentPage, setCurrentPage] = useState(1);
  const onChangePage = (id:number) => {
    setCurrentPage(id);
  };
  const url = useMemo(() => {
    const urlObj = new URL(getApiUrl('v3', 'dashboard/operators'));
    if (props.id) {
      urlObj.searchParams.set('id', props.id.toString());
    }
    if (currentPage !== 1) {
      urlObj.searchParams.set('page', currentPage.toString());
    }
    return urlObj.toString();
  }, [props.id, currentPage]);
  const { data } = useApi<OperatorsInterface>(url);
  const totalPages = data?.meta.totalPages || 1; 
  const headers = [
    'Identifiant',
    'Nom',
    'Siret',
  ];  
  const dataTable = data?.data.map((d) => [
    d.id,
    d.name,
    d.siret,
  ]) ?? [];
  return(
    <>
      <h3 className={fr.cx('fr-callout__title')}>{props.title}</h3>
      <Table data={dataTable}  headers={headers} colorVariant='blue-ecume'/>
      <Pagination count={totalPages} defaultPage={currentPage} onChange={onChangePage}/>
    </>
  );
}

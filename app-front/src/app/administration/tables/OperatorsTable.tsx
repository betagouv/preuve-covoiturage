import { Modal } from '@/components/common/Modal';
import Pagination from '@/components/common/Pagination';
import { getApiUrl } from '@/helpers/api';
import { useApi } from '@/hooks/useApi';
import { OperatorsInterface } from '@/interfaces/dataInterface';
import { fr } from '@codegouvfr/react-dsfr';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import Table from '@codegouvfr/react-dsfr/Table';
import { useMemo, useState } from 'react';

export default function OperatorsTable(props: {title:string, id:number | null, refresh: () => void}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentRow, setCurrentRow] = useState<OperatorsInterface['data'][0]>();
  const [openModal, setOpenModal] = useState(false);
  const [typeModal, setTypeModal] = useState<'update' | 'delete' | 'create'>('update');
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
  const deleteRequest = useApi(getApiUrl('v3', `dashboard/operator/${currentRow?.id}`));
  const otherRequest = useApi(getApiUrl('v3', `dashboard/operator`));
  const totalPages = data?.meta.totalPages || 1; 
  const headers = [
    'Identifiant',
    'Nom',
    'Siret',
    'Actions'
  ];  
  const dataTable = data?.data.map((d) => [
    d.id,
    d.name,
    d.siret,
    <ButtonsGroup
      key={d.id}
      buttons={[
        {
          children: 'modifier',
          iconId: 'fr-icon-refresh-line',
          priority: "secondary",
          onClick:() => {
            setCurrentRow(d);
            setOpenModal(true);
            setTypeModal('update');
          }
        },
        {
          children: 'supprimer',
          iconId: 'fr-icon-delete-bin-line',
          onClick:() => {
            setCurrentRow(d);
            setOpenModal(true);
            setTypeModal('delete');
          }
        },
      ]}
      buttonsSize="small"
      inlineLayoutWhen="lg and up"
    />
  ]) ?? [];

  const modalTitle = () => {
    switch (typeModal) {
      case 'update':
        return 'Modifier';
      case 'delete':
        return 'Supprimer';
      case 'create':
        return 'Créer';
      default:
        return 'Action';
    }
  };

  const modalSubmit = async() => {
    switch (typeModal) {
      case 'update':
        await otherRequest.sendRequest("POST",{
          name:"totorMotor",
          siret:"01234567891234"
        });
        props.refresh();
        break;
      case 'delete':
        await deleteRequest.sendRequest("DELETE");
        props.refresh();
        break;
      case 'create':
        alert('tata');
        break;
        default:
          break;
    }
  }; 
  
  return(
    <>
      <h3 className={fr.cx('fr-callout__title')}>{props.title}</h3>
      <Table data={dataTable}  headers={headers} colorVariant='blue-ecume' fixed />
      <Pagination count={totalPages} defaultPage={currentPage} onChange={onChangePage}/>
      <Modal open={openModal} title={modalTitle()} onClose={() => setOpenModal(false)} onSubmit={modalSubmit}>
        <>
          {typeModal ==='update' &&
            'toto'
          }
          {typeModal ==='delete' &&
            `Êtes-vous sûr de vouloir supprimer l'opérateur ${currentRow?.name} ?`
          }
        </>
      </Modal>
    </>
  );
}

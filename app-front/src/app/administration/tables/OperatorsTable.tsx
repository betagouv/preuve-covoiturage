import { Modal } from '@/components/common/Modal';
import Pagination from '@/components/common/Pagination';
import { getApiUrl } from '@/helpers/api';
import { useApi } from '@/hooks/useApi';
import { OperatorsInterface } from '@/interfaces/dataInterface';
import { useAuth } from '@/providers/AuthProvider';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import { Input } from "@codegouvfr/react-dsfr/Input";
import Table from '@codegouvfr/react-dsfr/Table';
import { useMemo, useState } from 'react';

export default function OperatorsTable(props: {title:string, id:number | null, refresh: () => void}) {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentRow, setCurrentRow] = useState<OperatorsInterface['data'][0]>({ name: '', siret: '' });
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
  const request = useApi<OperatorsInterface>(url);
  const { data } = request;
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
        return 'Ajouter';
      default:
        return 'Action';
    }
  };

  const modalSubmit = async() => {
    const { sendRequest } = request;
    switch (typeModal) {
      case 'update':
        await sendRequest(getApiUrl('v3', `dashboard/operator`), "PUT", currentRow);
        props.refresh();
        break;
      case 'delete':
        await request.sendRequest(getApiUrl('v3', `dashboard/operator/${currentRow.id}`), "DELETE");
        props.refresh();
        break;
      case 'create':
        await request.sendRequest(getApiUrl('v3', 'dashboard/operator'), "POST", currentRow);
        props.refresh();
        break;
      default:
          break;
    }
  }; 
  
  return(
    <>
      <h3 className={fr.cx('fr-callout__title')}>
        {props.title}
      </h3>
      {user?.role === 'registry.admin' &&
        <>
          <Button 
            iconId="fr-icon-add-circle-line"
            onClick={() => {
              setCurrentRow({ name: '', siret: '' });
              setOpenModal(true);
              setTypeModal('create');
            }}
            title="Ajouter un opérateur"
            size="small"
          >
            Ajouter
          </Button>
        </>
      }
      <Table data={dataTable} headers={headers} colorVariant='blue-ecume' fixed />
      <Pagination count={totalPages} defaultPage={currentPage} onChange={onChangePage}/>
      <Modal open={openModal} title={modalTitle()} onClose={() => setOpenModal(false)} onSubmit={modalSubmit}>
        <>
          {(typeModal ==='update' || typeModal === 'create') &&
            <>
              <Input
                label="Nom de l'opérateur"
                state="default"
                
                nativeInputProps={{
                  type: 'text',
                  value: currentRow ? currentRow.name : '',
                  onChange: (e) => setCurrentRow({...currentRow, name: e.target.value})
                }}
              />
              <Input
                label="Siret"
                state="default"
                nativeInputProps={{
                  type: 'text',
                  value: currentRow ? currentRow.siret : '',
                  onChange: (e) => setCurrentRow({...currentRow, siret: e.target.value})
                }}
              />
            </>
          }
          {typeModal ==='delete' &&
            `Êtes-vous sûr de vouloir supprimer l'opérateur ${currentRow?.name} ?`
          }
        </>
      </Modal>
    </>
  );
}

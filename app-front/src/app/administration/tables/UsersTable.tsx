import { Modal } from '@/components/common/Modal';
import Pagination from '@/components/common/Pagination';
import { getApiUrl } from '@/helpers/api';
import { enumRoles, labelRole } from '@/helpers/auth';
import { useActionsModal } from '@/hooks/useActionsModal';
import { useApi } from '@/hooks/useApi';
import { OperatorsInterface, TerritoriesInterface, UsersInterface } from '@/interfaces/dataInterface';
import { useAuth } from '@/providers/AuthProvider';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup';
import Input from '@codegouvfr/react-dsfr/Input';
import Select from '@codegouvfr/react-dsfr/Select';
import Table from '@codegouvfr/react-dsfr/Table';
import { useMemo, useState } from 'react';
import { z } from 'zod';

export default function UsersTable(props: {title:string, territoryId?:number, operatorId?:number, refresh: () => void}) {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const modal = useActionsModal<UsersInterface['data'][0]>(); 
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
    'Identifiant',
    'Rôle',
    'Prénom',
    'Nom',
    'Adresse mail',
    'Opérateur',
    'Territoire',
    'Actions'
  ];
  const operatorsApiUrl = getApiUrl("v3", `dashboard/operators`);
  const operatorsList = useApi<OperatorsInterface>(operatorsApiUrl).data?.data;
  const territoriesApiUrl = getApiUrl("v3", `dashboard/territories`);
  const territoriesList = useApi<TerritoriesInterface>(territoriesApiUrl).data?.data;
  const dataTable = data?.data?.map((d) => [
    d.id,
    labelRole(d.role as string),
    d.firstname,
    d.lastname,
    d.email,
    operatorsList?.find(o => o.id === d.operator_id)?.name,
    territoriesList?.find(t => t.id === d.territory_id)?.name,
    <ButtonsGroup
      key={d.id}
      buttons={[
        {
          children: 'modifier',
          iconId: 'fr-icon-refresh-line',
          priority: "secondary",
          onClick:() => {
            modal.setCurrentRow(d);
            modal.setErrors({});
            modal.setOpenModal(true);
            modal.setTypeModal('update');
          }
        },
        {
          children: 'supprimer',
          iconId: 'fr-icon-delete-bin-line',
          onClick:() => {
            modal.setCurrentRow(d);
            modal.setOpenModal(true);
            modal.setTypeModal('delete');
          }
        },
      ]}
      buttonsSize="small"
      inlineLayoutWhen="lg and up"
    />
  ]) ?? [];
  
  const formSchema = z.object({
    firstname: z.string().min(3, { message: 'Le prénom doit contenir au moins 3 caractères' }),
    lastname: z.string().min(3, { message: 'Le nom doit contenir au moins 3 caractères' }),
    email: z.string().email({ message: `L'adresse mail n'est pas valide` }),
    operator_id: z.number({ message: "L'identifiant n'est pas un nombre" }).optional(),
    territory_id: z.number({ message: "L'identifiant n'est pas un nombre" }).optional(),
    role: z.enum(enumRoles, { message: 'Le rôle n\'est pas valide' }),
  });
  return(
    <>
      <h3 className={fr.cx('fr-callout__title')}>
        {props.title}
      </h3>
      {(user?.role === 'registry.admin' || user?.role === 'territory.admin' || user?.role === 'operator.admin') &&
        <>
          <Button 
            iconId="fr-icon-add-circle-line"
            onClick={() => {
              modal.setCurrentRow({firstname: '', lastname: '', email: '', operator_id: undefined, territory_id: undefined, role: ''});
              modal.setOpenModal(true);
              modal.setErrors({});
              modal.setTypeModal('create');
            }}
            title="Ajouter un utilisateur"
            size="small"
          >
            Ajouter
          </Button>
        </>
      }
      <Table data={dataTable}  headers={headers} colorVariant='blue-ecume' fixed/>
      <Pagination count={totalPages} defaultPage={currentPage} onChange={onChangePage}/>
      <Modal 
        open={modal.openModal} 
        title={modal.modalTitle(modal.typeModal)} 
        onClose={() => modal.setOpenModal(false)} 
        onSubmit={async () => {
          await modal.submitModal('dashboard/user', formSchema)
          props.refresh();
        }} 
      >
        <>
          {(modal.typeModal ==='update' || modal.typeModal === 'create') &&
            <>
              <Input
                label="Prénom"
                state={modal.errors?.firstname ? "error" : "default"}
                stateRelatedMessage={modal.errors?.firstname}
                nativeInputProps={{
                  type: 'text',
                  value: modal.currentRow.firstname as string,
                  onChange: (e) => modal.validateInputChange(formSchema,'firstname', e.target.value)
                }}
              />
              <Input
                label="Nom"
                state={modal.errors!.lastname ? "error" : "default"}
                stateRelatedMessage={modal.errors!.lastname}
                nativeInputProps={{
                  type: 'text',
                  value: modal.currentRow.lastname as string,
                  onChange: (e) => modal.validateInputChange(formSchema,'lastname', e.target.value)
                }}
              />
              <Input
                label="Adresse mail"
                state={modal.errors!.email ? "error" : "default"}
                stateRelatedMessage={modal.errors!.email}
                nativeInputProps={{
                  type: 'text',
                  value: modal.currentRow.email as string,
                  onChange: (e) => modal.validateInputChange(formSchema,'email', e.target.value)
                }}
              />
              <Select
                label="Rôle"
                nativeSelectProps={{
                  value: modal.currentRow.role as string,
                  onChange:(e) => modal.validateInputChange(formSchema,'role', e.target.value),
                }}
              >
                <option value="" selected disabled hidden>Selectionnez un rôle</option>
                {enumRoles?.map( (r:string,i:number) => <option key={i} value={r}>{ labelRole(r)}</option>)}
              </Select>
              <Select
                label="Opérateur"
                nativeSelectProps={{
                  value: modal.currentRow.operator_id as number ?? undefined,
                  onChange:(e) => modal.validateInputChange(formSchema,'operator_id', e.target.value),
                }}
              >
                <option value="" selected disabled hidden>Selectionnez un opérateur</option>
                {operatorsList?.map( o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </Select>
              <Select
                label="Territoire"
                nativeSelectProps={{
                  value: modal.currentRow.territory_id as number ?? undefined,
                  onChange:(e) => modal.validateInputChange(formSchema,'territory_id', e.target.value),
                }}
              >
                <option value="" selected disabled hidden>Selectionnez un territoire</option>
                {territoriesList?.map( t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Select>
            </>
          }
          {modal.typeModal ==='delete' &&
            `Êtes-vous sûr de vouloir supprimer l'utilisateur ${modal.currentRow?.firstname} ${modal.currentRow?.lastname} ?`
          }
        </>
      </Modal>
    </>
  );
}
'use client'
import SelectTerritory from '@/components/common/SelectTerritory';
import { useAuth } from '@/providers/AuthProvider';
import { useState } from 'react';
import JourneysGraph from '../graphs/JourneysGraph';
import OperatorsGraph from '../graphs/OperatorsGraph';

export default function TabBref() {
  const { user } = useAuth();
  const [territoryId, setTerritoryId] = useState<string>(user?.territory_id ?? '36101')
  const onChangeTerritory = (id:string) => {
    setTerritoryId(id);
  };
  return(
    <>
      {user?.role === 'registry' &&
        <SelectTerritory defaultValue={territoryId} onChangeTerritory={onChangeTerritory} />
      }
      <JourneysGraph title='Evolution des trajets' territoryId={territoryId} />
      <OperatorsGraph title='Evolution des trajets par opérateurs' territoryId={territoryId} />
    </>    
  );
}
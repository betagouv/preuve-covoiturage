'use client'
import SelectTerritory from '@/components/common/SelectTerritory';
import { useAuth } from '@/providers/AuthProvider';
import CampaignsTable from '../tables/CampaignsTable';

export default function TabCampaigns() {
  const { user,onChangeTerritory } = useAuth();
  const territoryId = user?.territory_id ?? 1;
  return(
    <>
      {user?.role === 'registry.admin' &&
        <SelectTerritory defaultValue={territoryId} onChange={onChangeTerritory} />
      }
      <CampaignsTable title={`Campagnes d'incitation`} territoryId={user?.territory_id ?? 1} />
    </>    
  );
}
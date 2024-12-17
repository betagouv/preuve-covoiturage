'use client'
import { useAuth } from '@/providers/AuthProvider';
import CampaignsTable from '../tables/CampaignsTable';

export default function TabCampaigns() {
  const { user } = useAuth();
  return(
    <>
      <CampaignsTable title={`Campagnes d'incitation`} territoryId={user?.territory_id} />
    </>    
  );
}
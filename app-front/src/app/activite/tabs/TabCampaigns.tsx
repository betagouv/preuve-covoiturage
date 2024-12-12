'use client'
import { useAuth } from '@/providers/AuthProvider';
import CampaignsTable from '../tables/CampaignsTable';

export default function TabCampaigns() {
  const { user } = useAuth();
  return(
    <>
      <CampaignsTable title='Suivi des campagnes' territoryId={user?.territory_id} />
    </>    
  );
}
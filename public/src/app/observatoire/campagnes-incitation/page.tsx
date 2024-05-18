import PageTitle from '@/components/common/PageTitle';
import { fr } from '@codegouvfr/react-dsfr';
import Dashboard from './Dashboard';
import { Suspense } from 'react';

export default function IncentiveCampaignsPage() {
  const title = 'Recensement des campagnes d\'incitation financière au covoiturage';
  const subtitle = 'Une campagne d’incitation financière est une subvention versée par une collectivité locale compétente (AOM) pour la réalisation de trajets en covoiturage sur son territoire.';
    return (
      <div id='content'>
        <PageTitle title={title} />
        <h2 className={fr.cx('fr-h4')}>{subtitle}</h2>
        <Suspense>
          <Dashboard />
        </Suspense>
    </div>
    
  );
}
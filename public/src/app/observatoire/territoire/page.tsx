import PageTitle from '@/components/common/PageTitle';
import { fr } from '@codegouvfr/react-dsfr';
import Dashboard from './Dashboard';
import { Suspense } from 'react';


export default function Page() {

  const title = 'Comprendre le covoiturage quotidien sur votre territoire';
  const subtitle = 'Les données sont issues des plateformes de covoiturage partenaires du Registre de preuve de covoiturage et représentent environ 4% des trajets covoiturés chaque mois en 2023';
  const content = "Bien que partielle, cette source de données est à ce jour la plus complète pour comprendre certaines pratiques du covoiturage quotidien à l'échelle du territoire national."
    return (
      <div id='content'>
        <PageTitle title={title} />
        <h2 className={fr.cx('fr-h4')}>{subtitle}</h2>
        <p className={fr.cx('fr-text--lg')}>{content}</p>
        <Suspense>
          <Dashboard />
        </Suspense> 
    </div>
    
  );
}

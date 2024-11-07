import PageTitle from '@/components/common/PageTitle';
import FormSimulateur from '@/components/simulateur/Form';
import { fr } from "@codegouvfr/react-dsfr";
import { Metadata } from 'next';


export const metadata: Metadata = {
  title: 'Simulateur de campagne | Observatoire.covoiturage.gouv.fr',
  description: 'Simulateur de campagne Observatoire.covoiturage.gouv.fr',
}

export default function Simulateur() {
  
  return (
    <div id='content'>
      <PageTitle title={`Simuler une campagne d'incitation financière sur son territoire`} />
      <div className={fr.cx('fr-grid-row')}>
        <div className={fr.cx('fr-col')}>
          <FormSimulateur />
        </div>
      </div>
    </div>
  );
}

import PageTitle from '@/components/common/PageTitle';
import { fr } from '@codegouvfr/react-dsfr';
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Administration | app.covoiturage.gouv.fr',
  description: 'Développer le covoiturage de courte distance',
}

export default function Administration() {
  return (
    <div className={fr.cx('fr-container')}>
      <div id='content'>
        <PageTitle title={`Gérez votre espace`} />
        <Tabs
          label="Name of the tabs system"
          tabs={[
            {
              content: <p>Content of tab1</p>,
              label: 'Mon profil'
            },
            {
              content: <p>Content of tab2</p>,
              label: `Utilisateurs et accès`
            },
            {
              content: <p>Content of tab3</p>,
              label: 'Territoires'
            },
            {
              content: <p>Content of tab4</p>,
              label: 'Opérateurs'
            }
          ]}
        />
      </div>
    </div>
  );
}
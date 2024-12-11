import PageTitle from '@/components/common/PageTitle';
import { fr } from '@codegouvfr/react-dsfr';
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { Metadata } from 'next';
import Image from 'next/image';
import TabBref from './tabs/TabBref';

export const metadata: Metadata = {
  title: 'Activité | app.covoiturage.gouv.fr',
  description: 'Développer le covoiturage de courte distance',
}

export default function Activite() {
  return (
    <div className={fr.cx('fr-container')}>
      <div id='content'>
        <PageTitle title={`Suivez votre activité`} />
        <Tabs
          label="Name of the tabs system"
          tabs={[
            {
              content: <TabBref />,
              label: 'Activité en bref'
            },
            {
              content: <p>Content of tab2</p>,
              label: `Suivi de la campagne d'incitation`
            },
            {
              content: <p>Content of tab3</p>,
              label: 'Export des données'
            }
          ]}
        />
        <Tile
          enlargeLinkOrButton
          linkProps={{
            href: 'https://observatoire.covoiturage.gouv.fr/observatoire/territoire/',
            target:'_blank'
          }}
          orientation="horizontal"
          title="Accédez à de nombreux autres graphiques et indicateurs sur votre tableau de bord territoire de l’observatoire national du covoiturage"
          titleAs="h3"
          start={<Image src='https://static.covoiturage.beta.gouv.fr/Obs_021e3f4a41.svg' alt='' width={70} height={70} />}
          className={fr.cx('fr-mt-10v')}
        />
      </div>
    </div>
  );
}
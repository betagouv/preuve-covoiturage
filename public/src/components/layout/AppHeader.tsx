import { Header } from '@codegouvfr/react-dsfr/Header';
import Navigation from './Navigation';

export function AppHeader() {
  return (
    <Header
      brandTop={
        <>
          Ministère
          <br />
          de la transition
          <br />
          écologique
        </>
      }
      homeLinkProps={{
        href: '/',
        title: 'Accueil - Site national du covoiturage au quotidien',
      }}
      serviceTitle='COVOITURAGE.ecologie.gouv.fr'
      serviceTagline='Développer le covoiturage courte distance'
      quickAccessItems={[
        {
          iconId: 'fr-icon-account-line',
          linkProps: {
            href: 'https://app.covoiturage.beta.gouv.fr',
          },
          text: 'Connexion',
        },
      ]}
      navigation={<Navigation />}
    />
  );
}

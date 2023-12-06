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
        title: 'Accueil | Observatoire.covoiturage.gouv.fr',
        "aria-label": 'Accueil | Observatoire.covoiturage.gouv.fr',
      }}
      serviceTitle='Observatoire.covoiturage.gouv.fr'
      serviceTagline='Développer le covoiturage courte distance'
      navigation={<Navigation />}
    />
  );
}

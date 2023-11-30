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
      serviceTitle='Observatoire.covoiturage.gouv.fr'
      serviceTagline='Développer le covoiturage courte distance'
      navigation={<Navigation />}
    />
  );
}

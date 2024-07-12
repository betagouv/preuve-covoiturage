import { Header } from '@codegouvfr/react-dsfr/Header';

export function VitrineHeader() {
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
        href: '/startup-etat',
        title: 'Accueil | Covoiturage.beta.gouv.fr',
        "aria-label": 'Accueil | Covoiturage.beta.gouv.fr',
      }}
      serviceTitle='Covoiturage.beta.gouv.fr'
      serviceTagline='Accelerateur de covoiturage courte distance'
      quickAccessItems={[
        {
          iconId: 'fr-icon-team-line',
          linkProps: {
            href: 'https://app.covoiturage.beta.gouv.fr',
            target:'_blank',
          },
          text: 'Espace partenaire'
        },
        {
          iconId: 'fr-icon-article-line',
          linkProps: {
            href:'https://doc.covoiturage.beta.gouv.fr',
            target:'_blank',
          },
          text: 'Notre documentation'
        },
        {
          iconId: 'fr-icon-car-line',
          linkProps: {
            href: 'https://app.covoiturage.beta.gouv.fr/stats',
            target:'_blank',
          },
          text: 'Notre impact'
        }
      ]}
    />
  );
}

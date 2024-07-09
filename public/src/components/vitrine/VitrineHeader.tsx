import Badge from '@codegouvfr/react-dsfr/Badge';
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
        href: '/service',
        title: 'Accueil | Covoiturage.gouv.fr',
        "aria-label": 'Accueil | Covoiturage.gouv.fr',
      }}
      serviceTitle={<>Covoiturage.gouv.fr{' '}<Badge as="span" noIcon severity="success">Beta</Badge></>}
      serviceTagline='Accelerateur de covoiturage courte distance'
      quickAccessItems={[
        {
          iconId: 'fr-icon-add-circle-line',
          linkProps: {
            href: '#'
          },
          text: 'Espace partenaire'
        },
        {
          iconId: 'fr-icon-mail-fill',
          linkProps: {
            href:'#'
          },
          text: 'Notre documentation'
        },
        {
          iconId: 'fr-icon-mail-fill',
          linkProps: {
            href: '#'
          },
          text: 'Notre impact'
        }
      ]}
    />
  );
}

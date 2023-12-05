import { headerFooterDisplayItem } from '@codegouvfr/react-dsfr/Display';
import { Footer } from '@codegouvfr/react-dsfr/Footer';

export function AppFooter() {
  return (
    <Footer
      linkList={[
        {
          categoryName: 'Startup d\'Etat Covoiturage.gouv',
          links: [
            {
              linkProps: {
                href: 'https://doc.covoiturage.beta.gouv.fr/bienvenue/qui-sommes-nous',
                target:'_blank'
              },
              text: 'Qui sommes-nous ?'
            },
            {
              linkProps: {
                href: 'https://doc.covoiturage.beta.gouv.fr/nos-services/le-registre-de-preuve-de-covoiturage',
                target:'_blank'
              },
              text: 'Nos services'
            },
            {
              linkProps: {
                href: 'https://doc.covoiturage.beta.gouv.fr/bienvenue/faq-foire-aux-questions',
                target:'_blank'
              },
              text: 'FAQ'
            },
          ]
        },
        {
          categoryName: 'Autres liens utiles',
          links: [
            {
              linkProps: {
                href: 'https://www.expertises-territoires.fr/',
                target:'_blank'
              },
              text: 'Expertises-territoires'
            },
            {
              linkProps: {
                href: 'https://www.ecologie.gouv.fr/',
                target:'_blank'
              },
              text: 'Ecologie.gouv'
            },
            {
              linkProps: {
                href: 'https://www.ademe.fr/',
                target:'_blank'
              },
              text: 'ADEME'
            },
            {
              linkProps: {
                href: 'https://www.cerema.fr/',
                target:'_blank'
              },
              text: 'Cerema'
            },
          ]
        }
      ]}
      accessibility='partially compliant'
      termsLinkProps={{
        href: '/mentions-legales'
      }}
      websiteMapLinkProps={{
        href: '/plan-site'
      }}
      accessibilityLinkProps={{
        href: '/accessibilite'
      }}
      contentDescription='Le site officiel d’information sur le covoiturage de courte distance.
     Retrouvez toutes les informations et démarches administratives nécessaires au développement du covoiturage sur votre territoire.'
      operatorLogo={{
        alt: 'Registre de Preuve de Covoiturage',
        imgUrl: 'https://cms.covoiturage.beta.gouv.fr/assets/9733ec41-031e-4a93-b253-d4f20a109151.png',
        orientation: 'horizontal',
      }}
      partnersLogos={{
        sub: [
          {
            alt: 'CEREMA',
            href: 'https://www.cerema.fr',
            imgUrl: 'https://www.cerema.fr/themes/custom/uas_base/images/LogoCerema_horizontal.svg',
          },
          {
            alt: 'ADEME',
            href: 'https://www.ademe.fr',
            imgUrl: 'https://www.ademe.fr/wp-content/uploads/2022/11/ademe-logo-2022-1.svg',
          },
        ],
      }}
      bottomItems={[headerFooterDisplayItem]}
      license={
        <>
          Sauf mention contraire, tous les contenus de ce site sont sous{' '}
          <a href={'https://github.com/etalab/licence-ouverte/blob/master/LO.md'}>licence etalab-2.0</a> 
          {' '}Toutes les illustrations sont réalisés par <a href={'https://www.freepik.com'}>Freepik</a>
        </>
      }
    />
  );
}
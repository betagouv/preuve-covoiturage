import { headerFooterDisplayItem } from '@codegouvfr/react-dsfr/Display';
import { Footer } from '@codegouvfr/react-dsfr/Footer';
import { fr } from '@codegouvfr/react-dsfr'

export function AppFooter() {
  return (
    <Footer
      className={fr.cx('fr-mt-10v')}
      linkList={[
        {
          links: [
            {
              linkProps: {
                href: 'https://covoiturage.beta.gouv.fr/',
                target:'_blank'
              },
              text: 'Covoiturage.beta'
            },
          ]
        },
        {
          links: [
            {
              linkProps: {
                href: 'https://www.expertises-territoires.fr/',
                target:'_blank'
              },
              text: 'Expertise territoire'
            },
          ]
        },
        {
          links: [
            {
              linkProps: {
                href: 'https://www.cerema.fr/',
                target:'_blank'
              },
              text: 'Cerema'
            },
          ]
        },
        {
          links: [
            {
              linkProps: {
                href: 'https://www.ademe.fr/',
                target:'_blank'
              },
              text: 'Ademe'
            },
          ]
        },
        {
          links: [
            {
              linkProps: {
                href: 'https://www.ecologie.gouv.fr/',
                target:'_blank'
              },
              text: 'Ecologie.gouv'
            },
          ]
        },
      ]}
      accessibility='partially compliant'
      contentDescription='Le site officiel d’information sur le covoiturage de courte distance.
     Retrouvez toutes les informations et démarches administratives nécessaires au développement du covoiturage sur votre territoire.'
      operatorLogo={{
        alt: 'covoiturage courte distance',
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
          Sauf mention contraire, tous les contenus de ce site sont sous 
          <a href={'https://github.com/etalab/licence-ouverte/blob/master/LO.md'}>licence etalab-2.0</a> 
          {' '}Icon made by <a href={'https://www.flaticon.com/authors/freepik'}>Freepik</a> from 
          {' '}<a href={'www.flaticon.com'}>www.flaticon.com</a>
        </>
      }
    />
  );
}
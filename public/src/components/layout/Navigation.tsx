'use client';
import { MainNavigation } from '@codegouvfr/react-dsfr/MainNavigation';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  return (
    <MainNavigation
      items={[
        {
          linkProps: { href: '/', target: '_self' },
          text: 'Accueil',
          isActive: pathname === '/',
        },
        {
          menuLinks: [
            {
              linkProps: {
                href: '/observatoire/covoiturage-courte-distance',
              },
              text: 'Le covoiturage courte distance en France',
              isActive: pathname === '/observatoire/covoiturage-courte-distance',
            },
            {
              linkProps: {
                href: '/observatoire/comprendre-covoiturage',
              },
              text: 'Comprendre le covoiturage courte distance',
              isActive: pathname === '/observatoire/comprendre-covoiturage',
            },
            {
              linkProps: {
                href: '/observatoire/territoire',
              },
              text: 'Observer un territoire',
              isActive: pathname.startsWith('/observatoire/territoire'),
            },
            {
              linkProps: {
                href: '/observatoire/evaluation-plan-covoiturage',
              },
              text: 'Evaluation du plan national covoiturage',
              isActive: pathname === '/observatoire/evaluation-plan-covoiturage',
            },
            /*{
              linkProps: {
                href: '/observatoire/impact-actions',
              },
              text: 'Impact des actions pour développer le covoiturage',
              isActive: pathname === '/observatoire/impact-actions',
            },
            */
          ],
          text: 'Observatoire',
          isActive: pathname.startsWith('/observatoire'),
        },
        {
          megaMenu: {
            categories: [
              {
                categoryMainLink: {
                  linkProps: {
                    href: '#'
                  },
                  text: 'Préparer vos actions'
                },
                links: [
                  {
                    linkProps: {
                      href: '/collectivites/planification-et-evaluation',
                    },
                    text: 'Planification et évaluation',
                    isActive: pathname === '/collectivites/planification-et-evaluation',
                  },
                ]
              },
              {
                categoryMainLink: {
                  linkProps: {
                    href: '#',
                  },
                  text: 'Infrastructures et services de covoiturage'
                },
                links: [
                  {
                    linkProps: {
                      href: '/collectivites/aires-covoiturage',
                    },
                    text: 'Aires',
                    isActive: pathname === '/collectivites/aires-covoiturage',
                  },
                  {
                    linkProps: {
                      href: '/collectivites/ligne-de-covoiturage',
                    },
                    text: 'Lignes',
                    isActive: pathname === '/collectivites/ligne-de-covoiturage',
                  },
                  {
                    linkProps: {
                      href: '/collectivites/auto-stop-organise',
                    },
                    text: 'Auto-stop organisé',
                    isActive: pathname === '/collectivites/auto-stop-organise',
                  },
                  {
                    linkProps: {
                      href: '/collectivites/voies-reservees',
                    },
                    text: 'Voies réservées',
                    isActive: pathname === '/collectivites/voies-reservees',
                  },
                  {
                    linkProps: {
                      href: '/collectivites/plateformes-numeriques',
                    },
                    text: 'Covoiturage intermédié',
                    isActive: pathname === '/collectivites/plateformes-numeriques',
                  },
                ]
              },
              {
                categoryMainLink: {
                  linkProps: {
                    href: '#'
                  },
                  text: 'Actions'
                },
                links: [
                  {
                    linkProps: {
                      href: '/collectivites/campagnes-incitation-financieres',
                    },
                    text: 'Campagnes d\'incitation financières',
                    isActive: pathname === '/collectivites/campagnes-incitation-financieres',
                  },
                  {
                    linkProps: {
                      href: '/collectivites/registre-preuve-covoiturage-tiers-de-confiance',
                    },
                    text: 'Registre de preuves de covoiturage',
                    isActive: pathname === '/collectivites/registre-preuve-covoiturage-tiers-de-confiance',
                  },                  
                ]
              },
            ],
            leader: {
              link: {
                linkProps: {
                  href: '#'
                },
                text: 'Voir toute la rubrique'
              },
              paragraph: 'Lorem [...] elit ut.',
              title: 'Vous êtes une collectivité'
            }
          },
          text: 'Collectivités',
          isActive: pathname.startsWith('/collectivites'),
        },
        {
          menuLinks: [
            {
              linkProps: {
                href: '/vous-etes/entreprises',
              },
              text: 'Une entreprise',
              isActive: pathname === '/vous-etes/entreprises',
            },
            {
              linkProps: {
                href: '/vous-etes/particuliers',
              },
              text: 'Un particulier',
              isActive: pathname === '/vous-etes/particuliers',
            },
            {
              linkProps: {
                href: '/vous-etes/operateurs',
              },
              text: 'Un operateur',
              isActive: pathname === '/vous-etes/operateurs',
            }
          ],
          text: 'Vous êtes',
          isActive: pathname.startsWith('/vous-etes'),
        },
        {
          linkProps: { href: '/actualites', target: '_self' },
          text: 'Actualités',
          isActive: pathname === '/actualites',
        },
        {
          linkProps: { href: '/ressources', target: '_self' },
          text: 'Ressources',
          isActive: pathname === '/ressources',
        },
      ]}
    />
  );
}

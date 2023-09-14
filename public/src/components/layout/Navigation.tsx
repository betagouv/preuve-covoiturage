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
          menuLinks: [
            {
              linkProps: {
                href: '/collectivites/registre-preuve-covoiturage-tiers-de-confiance',
              },
              text: 'Le registre de preuve de covoiturage, un tiers de confiance',
              isActive: pathname === '/collectivites/registre-preuve-covoiturage-tiers-de-confiance',
            }
          ],
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

'use client';
import { MainNavigation } from '@codegouvfr/react-dsfr/MainNavigation';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  return (
    <MainNavigation
      id='header-navigation'
      items={[
        {
          linkProps: {
            href: '/activite',
            title: 'Activité',
            'aria-label': 'Activité'
          },
          text: 'Activité',
          isActive: pathname === '/activite',
        },
        {
          linkProps: {
            href: '/administration',
            title: 'Administration',
            'aria-label': 'Administration'
          },
          text: 'Administration',
          isActive: pathname === '/administration',
        },
        {
          linkProps: {
            href: 'https://doc.covoiturage.beta.gouv.fr/',
            target:'_blank',
            title: 'Documentation générale | nouvelle fenêtre',
            'aria-label': 'Documentation générale | nouvelle fenêtre'
          },
          text: 'Documentation générale',
        },
        {
          linkProps: {
            href: 'https://tech.covoiturage.beta.gouv.fr/',
            target:'_blank',
            title: 'Documentation technique | nouvelle fenêtre',
            'aria-label': 'Documentation technique | nouvelle fenêtre'
          },
          text: 'Documentation technique',
        },
        {
          linkProps: {
            href: 'https://observatoire.covoiturage.gouv.fr/observatoire/territoire/',
            target:'_blank',
            title: 'Tableau de bord de l\'observatoire | nouvelle fenêtre',
            'aria-label': 'Tableau de bord de l\'observatoire | nouvelle fenêtre'
          },
          text: 'Tableau de bord de l\'observatoire',
        },
      ]}
    />
  );
}

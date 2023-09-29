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
                href: '/observatoire/impact-politiques-mobilite',
              },
              text: 'Impact des différents politiques mobilité',
              isActive: pathname === '/observatoire/impact-politiques-mobilite',
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
            {
              linkProps: {
                href: '/observatoire/presentation',
              },
              text: 'A propos de l\'observatoire',
              isActive: pathname === '/observatoire/presentation',
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
                href: '/collectivites/planification-et-evaluation',
              },
              text: 'Comprendre et planifier le covoiturage',
              isActive: pathname === '/collectivites/planification-et-evaluation',
            },
            {
              linkProps: {
                href: '/collectivites/aires-covoiturage',
              },
              text: 'Infrastructures: Aires',
              isActive: pathname === '/collectivites/aires-covoiturage',
            },
            {
              linkProps: {
                href: '/collectivites/voies-reservees',
              },
              text: 'Infrastructures: Voies réservées',
              isActive: pathname === '/collectivites/voies-reservees',
            },
            {
              linkProps: {
                href: '/collectivites/ligne-de-covoiturage',
              },
              text: 'Infrastructures: Lignes',
              isActive: pathname === '/collectivites/ligne-de-covoiturage',
            },
            {
              linkProps: {
                href: '/collectivites/auto-stop-organise',
              },
              text: 'Infrastructures: Auto-stop organisé',
              isActive: pathname === '/collectivites/auto-stop-organise',
            },
            {
              linkProps: {
                href: '/collectivites/campagnes-incitation-financieres',
              },
              text: 'Services: Incitation financières',
              isActive: pathname === '/collectivites/campagnes-incitation-financieres',
            },
            {
              linkProps: {
                href: '/collectivites/plateformes-numeriques',
              },
              text: 'Service : plateformes de covoiturage en propre',
              isActive: pathname === '/collectivites/plateformes-numeriques',
            },
            {
              linkProps: {
                href: '/collectivites/communication-animation',
              },
              text: 'Service : Animation et communication',
              isActive: pathname === '/collectivites/communication-animation',
            },
            {
              linkProps: {
                href: 'https://aides-territoires.beta.gouv.fr/programmes/fonds-vert/',
              },
              text: 'Demander le fond vert',
            },
          ],
          text: 'Collectivités',
          isActive: pathname.startsWith('/collectivites'),
        },
        {
          menuLinks: [
            {
              linkProps: {
                href: '/autres-acteurs/covoitureurs',
              },
              text: 'Covoitureurs',
              isActive: pathname === '/autres-acteurs/covoitureurs',
            },
            {
              linkProps: {
                href: '/autres-acteurs/employeurs',
              },
              text: 'Employeurs',
              isActive: pathname === '/autres-acteurs/employeurs',
            },
            {
              linkProps: {
                href: '/autres-acteurs/plateformes',
              },
              text: 'Plateformes de covoiturages',
              isActive: pathname === '/autres-acteurs/plateformes',
            }
          ],
          text: 'Autres acteurs',
          isActive: pathname.startsWith('/autres-acteurs'),
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

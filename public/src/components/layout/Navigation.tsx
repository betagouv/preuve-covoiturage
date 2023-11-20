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
                href: '/observatoire/comprendre-covoiturage-quotidien',
              },
              text: 'Comprendre le covoiturage quotidien en France',
              isActive: pathname === '/observatoire/comprendre-covoiturage-quotidien',
            },
            {
              linkProps: {
                href: '/observatoire/territoire',
              },
              text: 'Comprendre le covoiturage quotidien sur votre territoire',
              isActive: pathname.startsWith('/observatoire/territoire'),
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
                href: '/observatoire/evaluation-plan-covoiturage',
              },
              text: 'Evaluation du plan national covoiturage',
              isActive: pathname === '/observatoire/evaluation-plan-covoiturage',
            },
            {
              linkProps: {
                href: '/observatoire/presentation',
              },
              text: 'L\'observatoire en quelques mots',
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
                href: '/collectivites/comprendre-et-planifier-le-covoiturage',
              },
              text: 'Comprendre et planifier le covoiturage',
              isActive: pathname === '/collectivites/comprendre-et-planifier-le-covoiturage',
            },
            {
              linkProps: {
                href: '/collectivites/aires-covoiturage',
              },
              text: 'Construire des aires de covoiturage',
              isActive: pathname === '/collectivites/aires-covoiturage',
            },
            {
              linkProps: {
                href: '/collectivites/voies-reservees',
              },
              text: 'Construire des voies réservées au covoiturage',
              isActive: pathname === '/collectivites/voies-reservees',
            },
            {
              linkProps: {
                href: '/collectivites/ligne-de-covoiturage',
              },
              text: 'Construire des lignes de covoiturage',
              isActive: pathname === '/collectivites/ligne-de-covoiturage',
            },
            {
              linkProps: {
                href: '/collectivites/auto-stop-organise',
              },
              text: 'Construire un réseau d\'auto-stop organisé',
              isActive: pathname === '/collectivites/auto-stop-organise',
            },
            {
              linkProps: {
                href: '/collectivites/campagnes-incitation-financieres',
              },
              text: 'Déployer une campagne d\'incitations financières',
              isActive: pathname === '/collectivites/campagnes-incitation-financieres',
            },
            {
              linkProps: {
                href: '/collectivites/plateformes-numeriques',
              },
              text: 'Déployer une plateforme numérique de covoiturage en marque blanche',
              isActive: pathname === '/collectivites/plateformes-numeriques',
            },
            {
              linkProps: {
                href: '/collectivites/communication-animation',
              },
              text: 'Communiquer et animer son territoire',
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

import { AppFooter } from '@/components/layout/AppFooter';
import { AppHeader } from '@/components/layout/AppHeader';
import { Follow } from '@/components/layout/Follow';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { fr } from "@codegouvfr/react-dsfr";
import { Metadata } from 'next';
import Auth from '../components/layout/Auth';


export const metadata: Metadata = {
  title: 'Accueil | app.covoiturage.gouv.fr',
  description: 'Développer le covoiturage de courte distance',
}

export default async function Home() {
  return (
    <>
      <AppHeader />
        <main tabIndex={-1}>
          <div className={fr.cx('fr-container')}>
          <div id='content'>
            <Auth />
          </div>
            <ScrollToTop />
          </div>
          <Follow />
        </main>
      <AppFooter />
    </>
  );
}

import { AppFooter } from '@/components/layout/AppFooter';
import { AppHeader } from '@/components/layout/AppHeader';
import { Follow } from '@/components/layout/Follow';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { fr } from "@codegouvfr/react-dsfr";
import { Metadata } from 'next';


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
            Hello world!
          </div>
            <ScrollToTop />
          </div>
          <Follow />
        </main>
      <AppFooter />
    </>
  );
}

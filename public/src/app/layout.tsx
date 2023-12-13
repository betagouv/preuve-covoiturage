import { AppFooter } from '@/components/layout/AppFooter';
import { Follow } from '@/components/layout/Follow';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { Skiplinks } from '@/components/layout/Skiplinks';
import { AppHeader } from '@/components/layout/AppHeader';
import { fr } from '@codegouvfr/react-dsfr';
import MuiDsfrThemeProvider from '@codegouvfr/react-dsfr/mui';
import { DsfrHead } from '@codegouvfr/react-dsfr/next-appdir/DsfrHead';
import { DsfrProvider } from '@codegouvfr/react-dsfr/next-appdir/DsfrProvider';
import { getHtmlAttributes } from '@codegouvfr/react-dsfr/next-appdir/getHtmlAttributes';
import Link from 'next/link';
import { StartDsfr } from '@/components/layout/StartDsfr';
import { defaultColorScheme } from '@/components/layout/defaultColorScheme';
import Analytics from '@/components/layout/Analytics';
import '../styles/global.scss';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comprendre le covoiturage quotidien sur votre territoire | Observatoire.covoiturage.gouv.fr',
  description: 'Tableau de bord pour comprendre le covoiturage de courte distance',
}


export default function RootLayout({ children }: { children: JSX.Element }) {
  //NOTE: The lang parameter is optional and defaults to "fr"
  const lang = 'fr';
  return (
    <html {...getHtmlAttributes({ defaultColorScheme, lang })}>
      <head>
        <Analytics />
        <StartDsfr />
        <DsfrHead
          Link={Link}
          preloadFonts={[
            //"Marianne-Light",
            //"Marianne-Light_Italic",
            'Marianne-Regular',
            //"Marianne-Regular_Italic",
            'Marianne-Medium',
            //"Marianne-Medium_Italic",
            'Marianne-Bold',
            //"Marianne-Bold_Italic",
            //"Spectral-Regular",
            //"Spectral-ExtraBold"
          ]}
        />
      </head>
      <body>
        <DsfrProvider>
          <MuiDsfrThemeProvider>
            <Skiplinks />
            <AppHeader />
            <main tabIndex={-1}>
              <div className={fr.cx('fr-container')}>
                {children}
                <ScrollToTop />
              </div>
              <Follow />
            </main>
            <AppFooter />
          </MuiDsfrThemeProvider>
        </DsfrProvider>
      </body>
    </html>
  );
}

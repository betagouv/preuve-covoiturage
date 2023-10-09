import { AppFooter } from '@/components/layout/AppFooter';
import { Follow } from '@/components/layout/Follow';
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
            <AppHeader />
            <div className={fr.cx('fr-container')}>{children}</div>
            <Follow />
            <AppFooter />
          </MuiDsfrThemeProvider>
        </DsfrProvider>
      </body>
    </html>
  );
}

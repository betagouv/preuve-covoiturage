import Analytics from '@/components/layout/Analytics';
import { Skiplinks } from '@/components/layout/Skiplinks';
import { StartDsfr } from '@/components/layout/StartDsfr';
import { defaultColorScheme } from '@/components/layout/defaultColorScheme';
import MuiDsfrThemeProvider from '@codegouvfr/react-dsfr/mui';
import { DsfrHead } from '@codegouvfr/react-dsfr/next-appdir/DsfrHead';
import { DsfrProvider } from '@codegouvfr/react-dsfr/next-appdir/DsfrProvider';
import { getHtmlAttributes } from '@codegouvfr/react-dsfr/next-appdir/getHtmlAttributes';
import { Metadata } from 'next';
import { Session } from 'next-auth';
import { SessionProvider } from "next-auth/react";
import Link from 'next/link';
import '../styles/global.scss';

export const metadata: Metadata = {
  title: 'app.covoiturage.gouv.fr',
  description: 'Développer le covoiturage de courte distance',
}


export default function RootLayout({ children, session }: { children: React.ReactNode, session: Session }) {
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
        <SessionProvider session={session}>
          <DsfrProvider>
            <MuiDsfrThemeProvider>
              <Skiplinks />
              {children}
            </MuiDsfrThemeProvider>
          </DsfrProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

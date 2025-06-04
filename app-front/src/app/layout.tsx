import { DsfrProvider } from "@/components/dsfr-bootstrap";
import {
  DsfrHead,
  getHtmlAttributes,
} from "@/components/dsfr-bootstrap/server-only-index";
import Analytics from "@/components/layout/Analytics";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { Follow } from "@/components/layout/Follow";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { Skiplinks } from "@/components/layout/Skiplinks";
import { AuthProvider } from "@/providers/AuthProvider";
import "@/styles/global.scss";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "app.covoiturage.gouv.fr",
  description: "Développer le covoiturage de courte distance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = "fr";
  return (
    <html {...getHtmlAttributes({ lang })}>
      <head>
        <Analytics />
        <DsfrHead
          preloadFonts={[
            //"Marianne-Light",
            //"Marianne-Light_Italic",
            "Marianne-Regular",
            //"Marianne-Regular_Italic",
            "Marianne-Medium",
            //"Marianne-Medium_Italic",
            "Marianne-Bold",
            //"Marianne-Bold_Italic",
            //"Spectral-Regular",
            //"Spectral-ExtraBold"
          ]}
        />
      </head>
      <body>
        <AuthProvider>
          <DsfrProvider lang={lang}>
            <MuiDsfrThemeProvider>
              <Skiplinks />
              <AppHeader />
              <main tabIndex={-1}>
                {children}
                <ScrollToTop />
                <Follow />
              </main>
              <AppFooter />
            </MuiDsfrThemeProvider>
          </DsfrProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

import { Header } from "@codegouvfr/react-dsfr/Header";
import Navigation from "./Navigation";

export function AppHeader() {
  return (
    <Header
      brandTop={
        <>
          Ministère
          <br />
          de la transition
          <br />
          écologique
          <br />
          et de la cohésion
          <br />
          des territoires
        </>
      }
      homeLinkProps={{
        href: "/",
        title: "Accueil | Espace partenaire Covoiturage.beta.gouv.fr",
        "aria-label": "Accueil | Espace partenaire Covoiturage.beta.gouv.fr",
      }}
      serviceTitle="Espace partenaire Covoiturage.beta.gouv.fr"
      serviceTagline="Ensemble, accélérons le covoiturage quotidien"
      navigation={<Navigation />}
      quickAccessItems={[
        {
          iconId: "fr-icon-add-circle-line",
          linkProps: {
            href: "https://doc.covoiturage.beta.gouv.fr/",
            target: "_blank",
          },
          text: "Documentation",
        },
      ]}
    />
  );
}

import { AuthButton } from "@/components/auth/AuthButton";
import { UserMenu } from "@/components/auth/UserMenu";
import { Header } from "@codegouvfr/react-dsfr/Header";
import Navigation from "./Navigation";

export function AppHeader() {
  return (
    <Header
      brandTop={
        <>
          Ministère
          <br />
          de l&apos;aménagement
          <br />
          du territoire et de
          <br />
          la décentralisation
        </>
      }
      homeLinkProps={{
        href: "/activite",
        title: "Accueil | Espace partenaire Covoiturage.beta.gouv.fr",
        "aria-label": "Accueil | Espace partenaire Covoiturage.beta.gouv.fr",
      }}
      serviceTitle="Espace partenaire Covoiturage.beta.gouv.fr"
      serviceTagline="Ensemble, accélérons le covoiturage quotidien"
      navigation={<Navigation />}
      quickAccessItems={[<UserMenu key="user-menu" />, <AuthButton key="auth-button" />]}
    />
  );
}

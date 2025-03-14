import PageTitle from "@/components/common/PageTitle";
import { fr } from "@codegouvfr/react-dsfr";
import { type Metadata } from "next";
import TabsNav from "./tabs/TabsNav";

export const metadata: Metadata = {
  title: "Administration | app.covoiturage.gouv.fr",
  description: "Développer le covoiturage de courte distance",
};

export default function Administration() {
  return (
    <div className={fr.cx("fr-container")}>
      <div id="content">
        <PageTitle title={`Gérez votre espace`} />
        <TabsNav />
      </div>
    </div>
  );
}

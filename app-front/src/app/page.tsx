import PageTitle from "@/components/common/PageTitle";
import { fr } from "@codegouvfr/react-dsfr";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { type Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Accueil | app.covoiturage.gouv.fr",
  description: "Développer le covoiturage de courte distance",
};

export default function Home() {
  return (
    <div className={fr.cx("fr-container")}>
      <div id="content" className="text-center">
        <PageTitle title={`Espace partenaire de Covoiturage.beta.gouv.fr`} />
        <div>
          <p>Pour exporter les données des trajets</p>
          <p>Pour un suivi des campagnes d’incitation</p>
        </div>
        <div
          className={fr.cx(
            "fr-grid-row",
            "fr-grid-row--gutters",
            "fr-grid-row--center"
          )}
        >
          <div className={fr.cx("fr-col-12", "fr-col-md-6")}>
            <div className={fr.cx("fr-h2")}>Comment devenir partenaire ?</div>
            <ButtonsGroup
              buttons={[
                {
                  children: "Collectivité, contactez-nous",
                  linkProps: {
                    href: "/",
                    title: `Accueil - nouvelle fenêtre`,
                    "aria-label": `Accueil - nouvelle fenêtre`,
                    target: "_blank",
                  },
                  priority: "secondary",
                },
                {
                  children: "Opérateurs, découvrez les étapes",
                  linkProps: {
                    href: "/",
                    title: `Accueil - nouvelle fenêtre`,
                    "aria-label": `Accueil - nouvelle fenêtre`,
                    target: "_blank",
                  },
                  priority: "secondary",
                },
              ]}
            />
            <Image
              src="https://static.covoiturage.beta.gouv.fr/medium_Car_driving_bro_d766ec81d5.png"
              alt=""
              width={450}
              height={450}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

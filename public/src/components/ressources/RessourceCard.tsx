import { Card } from "@codegouvfr/react-dsfr/Card";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { RessourceCardProps } from "@/interfaces/ressources/componentsInterface";

export default function RessourceCard(props: RessourceCardProps) {
  return(
    <Card
      title={props.title}
      desc={props.content}
      detail={`Publié le ${props.date}`}
      imageAlt={props.img_legend}
      imageUrl={props.img}
      footer={
        <ButtonsGroup
          alignment='right'
          buttonsEquisized
          buttons={[
            {
              children: 'Télécharger la ressource',
              iconId: "fr-icon-download-fill",
              iconPosition: "right",
              linkProps: {
                href: props.href,
              },
            },
          ]}
        />
      }
      horizontal={props.horizontal}
    />
  )
}
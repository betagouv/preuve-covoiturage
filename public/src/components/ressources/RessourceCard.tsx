import { Card } from "@codegouvfr/react-dsfr/Card";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { RessourceCardProps } from "@/interfaces/ressources/componentsInterface";
import { ButtonProps } from "@codegouvfr/react-dsfr/Button";

export default function RessourceCard(props: RessourceCardProps) {
  const buttonsGroup = () => {
    const buttons = [];
    if (props.file) {
      buttons.push({
        children: 'Télécharger la ressource',
        iconId: "fr-icon-download-fill",
        iconPosition: "right",
        linkProps: {
          href: props.file,
        },
      })
    }
    if (props.link) {
      buttons.push({
        children: 'En savoir plus',
        iconId: "fr-icon-external-link-fill",
        iconPosition: "right",
        priority:'secondary',
        linkProps: {
          href: props.link,
        },
      })
    }
    return buttons as [ButtonProps, ...ButtonProps[]]
  };
  
  return(
    <Card
      title={props.title}
      desc={props.content}
      detail={`Publié le ${props.date}`}
      imageAlt={props.img_legend ? props.img_legend : ''}
      imageUrl={props.img}
      footer={
        <ButtonsGroup
          alignment='right'
          buttonsEquisized
          buttons={buttonsGroup()}
        />
      }
      horizontal={props.horizontal}
    />
  )
}
import { ButtonsGroup } from '@codegouvfr/react-dsfr/ButtonsGroup';
import { fr } from '@codegouvfr/react-dsfr';

export default function Definition() {
  const defTitle = `Le covoiturage, qu'est-ce que c’est ?`;
  const def = `L’article L. 3132-1 du code des transports définit le covoiturage comme « l’utilisation en commun 
  d’un véhicule terrestre à moteur par un conducteur et un ou plusieurs passagers, effectuée à titre non onéreux,
   excepté le partage des frais, dans le cadre d’un déplacement que le conducteur effectue pour son propre compte.
   Leur mise en relation, à cette fin, peut être effectuée à titre onéreux […] ». Il y a donc covoiturage dès le partage
   d’un trajet entre un conducteur et un passager. En conséquence, le covoiturage peut donc être interne à la famille ou 
   extra familial tel que pour des trajets réalisés dans le cadre de sorties de loisirs proches (réunion associative, etc.) 
   ou plus éloignées (balade, cinéma, piscine, salle de sport, etc.).`;

  return (
    <div id='definition' className={fr.cx('fr-grid-row', 'fr-py-5v')}>
      <div className={fr.cx('fr-col')}>
        <h2>{defTitle}</h2>
        <p>{def}</p>
        <ButtonsGroup
          alignment='right'
          buttonsEquisized
          buttons={[
            {
              children: 'En savoir plus',
              linkProps: {
                href: '#',
              },
            },
          ]}
        />
      </div>
    </div>
  );
}

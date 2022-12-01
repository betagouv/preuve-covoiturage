import { DefaultNotification, DefaultTemplateData } from '@pdc/provider-notification';
import { SimulateOnPasGeoRequiredParams } from '../shared/policy/simulateOnPastGeo.contract';
import { ResultInterface as SimulateOnPastResult } from '../shared/policy/simulateOnPastGeo.contract';

export interface SimulatePolicyFormTemplateData {
  title: string;
  preview?: string;
  header_alt?: string;
  header_image_src?: string;
  app_url: string;
  contact_email: string;

  simulation_form_simulation_param: SimulateOnPasGeoRequiredParams;
  simulation_form_simulation_result: { [key: number]: SimulateOnPastResult };
}

const defaultData: Partial<DefaultTemplateData> = {
  hero_alt: 'Demande de simulation de campagne',
  hero_image_src: 'https://x0zwu.mjt.lu/tplimg/x0zwu/b/xp6yw/vjn2p.png',
  title: 'Demande de simulation de campagne',
  preview: 'Votre simulation de campagne sur le Registre de preuve de covoiturage',
  message_html: `
  <p>
  Vous trouverez ci-dessous le résultat ainsi que le récapitulatif de la demande de simulation qui nous a été adressée.
</p>
<p>
  Récapitulatif de la demande :
</p>
<ul>
  <li>Territoire sélectionné : [nom du territoire]</li>
  <li>Scénario de campagne sélectionné : [titre du scénario]</li>
  <li>Rappel des paramètres de la campagne :</li>
  <li>TODO</li>
</ul>
<p>
  Résultat de la simulation :
  Cette simulation se base sur les trajets effectués sur votre territoire du [date de début] au [date de fin]
</p>
<p>
<ul>
  <li>
    Simulation pour 1 mois :
    <ul>
      <li> Volume de trajets incités : [nbre de trajets]</li>
      <li> Montant incités distribués : [montant en €] €</li>
    </ul>
  </li>
  <li>
    Simulation pour 3 mois :
    <ul>
      <li> Volume de trajets incités : [nbre de trajets]</li>
      <li> Montant incités distribués : [montant en €] €</li>
    </ul>
  </li>
  <li>
    Simulation pour 6 mois :
    <ul>
      <li> Volume de trajets incités : [nbre de trajets]</li>
      <li> Montant incités distribués : [montant en €] €</li>
    </ul>
  </li>
</ul>
</p>
<p>
  Destinataire de la simulation

  [Nom] [Prénom]
  [Poste]
  [Territoire]
  [email]
</p>
<p>
  Pour toute question sur cette simulation ou sur la mise en place d'une campagne d'incitation, merci de contacter
  territoire@covoiturage.beta.gouv.fr
</p>    
      `,
  message_text: ``,
};

export class SimulatePolicyNotification extends DefaultNotification {
  static readonly subject = 'Demande de simulation';
  constructor(to: string, data: Partial<DefaultTemplateData>) {
    super(to, {
      ...defaultData,
      ...data,
    });
  }
}

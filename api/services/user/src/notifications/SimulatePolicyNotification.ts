import { AbstractMailNotification } from '@pdc/provider-notification';
import { AbstractTemplate } from '@pdc/provider-template';
import { SimulateOnPastGeoRequiredParams } from '../shared/policy/simulateOnPastGeo.contract';

export interface SimulatePolicyFormTemplateData {
  title: string;
  preview?: string;
  header_alt?: string;
  header_image_src?: string;
  app_url: string;
  contact_email: string;

  simulation_form_email: string;
  simulation_form_fullname: string;
  simulation_form_job: string;
  simulation_form_simulation_param: SimulateOnPastGeoRequiredParams;

  simulation_result_one_month_trip_subsidized: number;
  simulation_result_one_month_amount: number;

  simulation_result_three_months_trip_subsidized: number;
  simulation_result_three_months_amount: number;

  simulation_result_six_months_trip_subsidized: number;
  simulation_result_six_months_amount: number;
}

export class SimulatePolicyFormMJMLTemplate extends AbstractTemplate<SimulatePolicyFormTemplateData> {
  static readonly template = `
<mjml version="4.6.3" lang="fr">
  <mj-head>
    <mj-title>
      {{ title }}
    </mj-title>
    {{#if preview}}
    <mj-preview>
      {{ preview }}
    </mj-preview>
    {{/if}}
    <mj-attributes>
      <mj-text color="#5e6977" font-family="Arial, sans-serif" font-size="13px" />
      <mj-section background-color="#ffffff" padding="0 0 0 0" text-align="center" />
      <mj-column padding="0 0 0 0" />
      <mj-image border="none" target="_blank" title="" height="auto" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f2f5f9">
    {{#if header_image_src}}
    <mj-section>
      <mj-column vertical-align="top">
        <mj-image
          align="left"
          alt="{{ header_alt }}"
          container-background-color="#ffffff"
          href="{{ app_url }}"
          padding="20px 20px 20px 20px"
          src="{{ header_image_src }}"
          width="1200px"
        ></mj-image>
      </mj-column>
    </mj-section>
    {{/if}}
    <mj-section>
      <mj-column>
        <mj-text align="left" line-height="22px" color="#000000" padding="20px 40px 40px 40px">
        <p>
        Bonjour,
        </p>
        <p>
        Vous trouverez ci-dessous le résultat ainsi que le récapitulatif de la demande de simulation qui nous a été adressée.
      </p>
      <p>
        <b>Récapitulatif de la demande :</b>
      </p>
      <ul>
        <li>Territoire sélectionné : {{ simulation_territory_name }} </li>
        <li>Scénario de campagne sélectionné :  {{ simulation_form_simulation_param.policy_template_id }} </li>
        <li>Rappel des paramètres de la campagne :</li>
        {{{ simulation_policy_description_html }}}
      </ul>
      <p>
        <b>Résultat de la simulation :</b>
      </p>
      <p>
      <ul>
        <li>
          Simulation pour 1 mois :
          <ul>
            <li> Volume de trajets incités : {{ simulation_result_one_month_trip_subsidized }}</li>
            <li> Montant incités distribués : {{ simulation_result_one_month_amount }} €</li>
          </ul>
        </li>
        <li>
          Simulation pour 3 mois :
          <ul>
            <li> Volume de trajets incités :{{ simulation_result_three_months_trip_subsidized }} </li>
            <li> Montant incités distribués : {{ simulation_result_three_months_amount }} €</li>
          </ul>
        </li>
        <li>
          Simulation pour 6 mois :
          <ul>
            <li> Volume de trajets incités : {{ simulation_result_six_months_trip_subsidized }} </li>
            <li> Montant incités distribués : {{ simulation_result_six_months_amount }} €</li>
          </ul>
        </li>
      </ul>
      </p>
      <p>
        <b>Destinataire de la simulation : </b>
      
        <div>Nom: {{ simulation_form_fullname }}</div>
        <div>Poste: {{ simulation_form_job }}</div>
        <div>Email: {{ simulation_form_email }}</div>
      </p>
      <p>
        Pour toute question sur cette simulation ou sur la mise en place d'une campagne d'incitation, merci de contacter
        territoire@covoiturage.beta.gouv.fr
      </p>    
        </mj-text>
        <mj-text align="left" line-height="22px" color="#000000" padding="20px 40px 40px 40px">
          A bientôt
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#f2f5f9">
      <mj-column vertical-align="middle">
        <mj-text
          align="center"
          line-height="20px"
          padding="10px 25px 0px 25px"
          font-weight="700"
          font-size="12px"
          color="#000000"
        >
          <span>Registre de preuve de covoiturage - {{ app_url }}</span>
        </mj-text>
        <mj-text
          align="center"
          line-height="20px"
          padding="10px 25px 0px 25px"
          font-size="12px"
          color="#000000"
        >
          <span>
            Un service fourni grâce au soutien financier de l'ADEME,
            puis de la DGITM et à l’appui stratégique et opérationnel de la DINUM.
          </span>
        </mj-text>
          <mj-text
          align="center"
          line-height="20px"
          padding="10px 25px 0px 25px"
          font-size="12px"
          color="#000000"
          >
            <span>
              ✉ <a style="color:#000000" href="mailto:{{contact_email}}">{{contact_email}}</a>
            </span>
        </mj-text>
        <mj-text
          align="center"
          line-height="20px"
          padding="10px 25px 0px 25px"
          font-size="12px"
          color="#000000"
        >
          <span>📍
            <a
              target="_blank"
              style="color:#000000; font-size:12px"
              href="https://www.openstreetmap.org/node/2353712460"
            >
              20 avenue de Ségur, 75007 Paris
            </a>
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
  `;
}

export class SimulatePolicyFormTextTemplate extends AbstractTemplate<SimulatePolicyFormTemplateData> {
  static readonly template = `
  <p>
  Vous trouverez ci-dessous le résultat ainsi que le récapitulatif de la demande de simulation qui nous a été adressée.
</p>
<p>
  Récapitulatif de la demande :
</p>
<ul>
  <li>Territoire sélectionné : {{ formParams.simulation.territory_name }} </li>
  <li>Scénario de campagne sélectionné :  {{ formParams.simulation.policy_template_id }} </li>
  <li>Rappel des paramètres de la campagne :</li>
  {{{ simulation_policy_description_html }}}
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
      <li> Volume de trajets incités : {{ simulation_result_one_month_trip_subsidized }}</li>
      <li> Montant incités distribués : {{ simulation_result_one_month_amount }} €</li>
    </ul>
  </li>
  <li>
    Simulation pour 3 mois :
    <ul>
      <li> Volume de trajets incités :{{ simulation_result_three_months_trip_subsidized }} </li>
      <li> Montant incités distribués : {{ simulation_result_three_months_amount }} €</li>
    </ul>
  </li>
  <li>
    Simulation pour 6 mois :
    <ul>
      <li> Volume de trajets incités : {{ simulation_result_six_months_trip_subsidized }} </li>
      <li> Montant incités distribués : {{ simulation_result_six_months_amount }} €</li>
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
      `;
}

export class SimulatePolicyNotification extends AbstractMailNotification<SimulatePolicyFormTemplateData> {
  static templateMJML = SimulatePolicyFormMJMLTemplate;
  static templateText = SimulatePolicyFormTextTemplate;
  static readonly subject = 'Demande de simulation';

  constructor(to: string, data: Partial<SimulatePolicyFormTemplateData>) {
    super(to, {
      app_url: 'https://covoiturage.beta.gouv.fr',
      contact_email: 'contact@covoiturage.beta.gouv.fr',
      header_image_src: 'https://x0zwu.mjt.lu/tplimg/x0zwu/b/xp6yw/vkw1r.png',
      header_alt: 'Demande de simulation',
      ...data,
    });
  }
}

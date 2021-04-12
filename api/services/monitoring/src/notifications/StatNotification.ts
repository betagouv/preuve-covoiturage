import { AbstractTemplate } from '@pdc/provider-template';
import { AbstractMailNotification } from '@pdc/provider-notification';

export interface StatTemplateData {
  title: string;
  preview?: string;
  header_alt?: string;
  header_image_src?: string;
  acquired: number;
  acquired_failed: number;
  acquired_failed_ratio: number;
  carpools: number;
  missing: number;
  missing_ratio: number;
  last_missing_by_date:  {
    date: Date;
    count: number;
  }[];
  app_url: string;
  contact_email: string;
}

export class StatMJMLTemplate extends AbstractTemplate<StatTemplateData> {
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
          <p>Bonjour,</p>
          
          <p>
            <h2>Statistique d'acquisition</h2>
            <ul>
              <li>Total acquis : {{ acquired }}</li>
              <li>Total échoué : {{ acquired_failed }}</li>
              <li>Taux d'échec : {{ acquired_failed_ratio }}</li>
              <li>Total enregistrés : {{ carpools }}</li>
              <li>Total manquants: {{ missing }}</li>
              <li>Taux de manquants : {{ missing_ratio }}</li>
            </ul>
          </p>
          <p>
            <h2>Par date</h2>
            <ul>
              {{#each last_missing_by_date}}
              <li>{{ this.date }} : {{ this.count }}</li>
              {{/each}}
            </ul>

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
          <span>Un service fourni grâce au soutien financier de l'ADEME, puis de la DGITM et à l’appui stratégique et opérationnel de la DINUM.</span>
        </mj-text>
          <mj-text
          align="center"
          line-height="20px"
          padding="10px 25px 0px 25px"
          font-size="12px"
          color="#000000"
          >
            <span>✉ <a style="color:#000000" href="mailto:{{contact_email}}">{{contact_email}}</a></span>
        </mj-text>
        <mj-text
          align="center"
          line-height="20px"
          padding="10px 25px 0px 25px"
          font-size="12px"
          color="#000000"
        >
          <span>📍 <a target="_blank" style="color:#000000; font-size:12px" href="https://www.openstreetmap.org/node/2353712460">20 avenue de Ségur, 75007 Paris</a></span>
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
  `;
}

export class StatTextTemplate extends AbstractTemplate<StatTemplateData> {
  static readonly template = `
Bonjour,

Voici les statistiques journalière.

- Total acquis : {{ acquired }}
- Total échoué : {{ acquired_failed }}
- Taux d'échec : {{ acquired_failed_ratio }}
- Total enregistrés : {{ carpools }}
- Total manquants: {{ missing }}
- Taux de manquants : {{ missing_ratio }}

Par date :

{{#each last_missing_by_date}}
- {{ this.date }} : {{ this.count }}
{{/each}}

A bientôt
-- 
Registre de preuve de covoiturage - {{ app_url }}
Un service fourni grâce au soutien financier de l'ADEME, puis de la DGITM et à l’appui stratégique et opérationnel de la DINUM.
✉ {{contact_email}}
📍 20 avenue de Ségur, 75007 Paris
  `;
};

export class StatNotification extends AbstractMailNotification<StatTemplateData> {
  static templateText = StatTextTemplate;
  static templateMJML = StatMJMLTemplate;
  static readonly subject: string = 'Registre de preuve de covoiturage';

  constructor(to: string, data: Partial<StatTemplateData>) {
    super(
      to,
      {
        app_url: 'https://covoiturage.beta.gouv.fr',
        contact_email: 'contact@covoiturage.beta.gouv.fr',
        header_image_src: 'https://x0zwu.mjt.lu/tplimg/x0zwu/b/xp6yw/vkw1r.png',
        header_alt: 'Registre de preuve de covoiturage',
        ...data,
      }
    );
  }
}


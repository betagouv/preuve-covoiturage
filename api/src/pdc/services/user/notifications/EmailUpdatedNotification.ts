import { DefaultNotification, DefaultTemplateData } from '@pdc/providers/notification';

const defaultData: Partial<DefaultTemplateData> = {
  hero_alt: "Changement d'adresse email",
  hero_image_src: 'https://x0zwu.mjt.lu/tplimg/x0zwu/b/xp6ym/vjn23.png',
  title: "Changement d'adresse email",
  preview: 'Vous avez demandé à changer votre adresse email sur le Registre de preuve de covoiturage.',
  message_html: `
<p>Vous avez demandé à changer votre adresse email sur le Registre de preuve de covoiturage.</p>
<p>Si vous n’êtes pas à l’origine de cette modification, veuillez contacter l’administrateur du service. </p>
    `,
  message_text: `
Vous avez demandé à changer votre adresse email sur le Registre de preuve de covoiturage.
Si vous n’êtes pas à l’origine de cette modification, veuillez contacter l’administrateur du service.
    `,
};

export class EmailUpdatedNotification extends DefaultNotification {
  static readonly subject = "Changement d'adresse email";
  constructor(to: string, data: Partial<DefaultTemplateData>) {
    super(to, {
      ...defaultData,
      ...data,
    });
  }
}

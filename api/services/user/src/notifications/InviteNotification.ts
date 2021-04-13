import { DefaultNotification, DefaultTemplateData } from '@pdc/provider-notification';

const defaultData: Partial<DefaultTemplateData> = {
  hero_alt: 'Invitation',
  hero_image_src: 'https://x0zwu.mjt.lu/tplimg/x0zwu/b/xp6yw/vjn2p.png',
  action_message: 'Choisir mon mot de passe',
  title: 'Invitation',
  preview: 'Vous avez été invité(e) à accéder au Registre de preuve de covoiturage.',
  message_text: 'Vous avez été invité(e) à accéder au Registre de preuve de covoiturage.',
};

export class InviteNotification extends DefaultNotification {
  static readonly subject = 'Invitation';
  constructor(to: string, data: Partial<DefaultTemplateData>) {
    super(to, {
      ...defaultData,
      ...data,
    });
  }
}

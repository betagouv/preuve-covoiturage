import { DefaultNotification, DefaultTemplateData } from '@pdc/provider-notification';

const defaultData: Partial<DefaultTemplateData> = {
    hero_alt: 'Confirmer votre email',
    hero_image_src: 'https://x0zwu.mjt.lu/tplimg/x0zwu/b/xp6ym/vjn23.png',
    action_message: 'Confirmer mon email',
    title: 'Confirmation de votre email',
    preview: 'Vous avez demandé à changer votre adresse email sur le Registre de preuve de covoiturage.',
    message_text: 'Vous avez demandé à changer votre adresse email sur le Registre de preuve de covoiturage.'
};

export class ConfirmEmailNotification extends DefaultNotification {
    static readonly subject = 'Confirmer mon email';
    constructor(to: string, data: Partial<DefaultTemplateData>) {
        super(to, {
            ...defaultData,
            ...data,
        });
    }
}

import { DefaultNotification, DefaultTemplateData } from '@pdc/provider-notification';

const defaultData: Partial<DefaultTemplateData> = {
    hero: {
        alt: 'Confirmer votre email',
        imageSrc: 'https://x0zwu.mjt.lu/tplimg/x0zwu/b/xp6ym/vjn23.png',
    },
    action: {
        message: 'Confirmer mon email',
    },
    title: 'Confirmation de votre email',
    preview: 'Vous avez demandé à changer votre adresse email sur le Registre de preuve de covoiturage.',
    messageText: 'Vous avez demandé à changer votre adresse email sur le Registre de preuve de covoiturage.'
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

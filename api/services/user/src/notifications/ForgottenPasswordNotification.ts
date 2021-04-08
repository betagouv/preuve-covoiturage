import { DefaultNotification, DefaultTemplateData } from '@pdc/provider-notification';

const defaultData: Partial<DefaultTemplateData> = {
    hero: {
        alt: 'Mot de passe oublié',
        imageSrc: 'https://x0zwu.mjt.lu/tplimg/x0zwu/b/q2hz/vjnmy.png',
    },
    action: {
        message: 'Choisir un nouveau mot de passe',
    },
    title: 'Mot de passe oublié',
    preview: "Vous avez demandé la réinitialisation de votre mot de passe.",
    messageText: `
Vous avez demandé la réinitialisation de votre mot de passe sur le site du Registre de preuve de covoiturage.
    `,
};

export class ForgottenPasswordNotification extends DefaultNotification {
    static readonly subject = 'Mot de passe oublié';
    constructor(to: string, data: Partial<DefaultTemplateData>) {
        super(to, {
            ...defaultData,
            ...data,
        });
    }
}

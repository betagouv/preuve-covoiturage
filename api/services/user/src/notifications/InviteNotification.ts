import { DefaultNotification, DefaultTemplateData } from '@pdc/provider-notification';

const defaultData: Partial<DefaultTemplateData> = {
    hero: {
        alt: 'Invitation',
        imageSrc: 'https://x0zwu.mjt.lu/tplimg/x0zwu/b/xp6yw/vjn2p.png',
    },
    action: {
        message: 'Choisir mon mot de passe',
    },
    title: 'Invitation',
    preview: 'Vous avez été invité(e) à accéder au Registre de preuve de covoiturage.',
    messageText: 'Vous avez été invité(e) à accéder au Registre de preuve de covoiturage.',
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

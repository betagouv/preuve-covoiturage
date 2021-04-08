import { DefaultNotification, DefaultTemplateData } from '@pdc/provider-notification';

const defaultData: Partial<DefaultTemplateData> = {
    hero: {
        alt: 'Export des données',
        imageSrc: 'https://x0zwu.mjt.lu/tplimg/x0zwu/b/x5zwm/vkxn4.png',
    },
    title: "Erreur d'export des données",
    preview: "Une erreur s'est produite lors de l'export des données.",
    messageHTML: `
<p> 
Une erreur s'est produite lors de l'export des données.
L'équipe technique du Registre de preuve de covoiturage a été notifiée.
</p>
<p>
Nous vous invitons à relancer un export ultérieurement ou nous contacter directement à l'adresse suivante
<a href="mailto:contact@covoiturage.beta.gouv.fr">contact@covoiturage.beta.gouv.fr</a>
</p>
    `,
    messageText: `
Une erreur s'est produite lors de l'export des données.
L'équipe technique du Registre de preuve de covoiturage a été notifiée.

Nous vous invitons à relancer un export ultérieurement ou nous contacter par mail <contact@covoiturage.beta.gouv.fr>
    `,
};

export class ExportCSVErrorNotification extends DefaultNotification {
    static readonly subject = "Erreur d'export des données";
    constructor(to: string, data: Partial<DefaultTemplateData>) {
        super(to, {
            ...defaultData,
            ...data,
        });
    }
}

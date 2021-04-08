import { DefaultNotification, DefaultTemplateData } from '@pdc/provider-notification';

const defaultData: Partial<DefaultTemplateData> = {
    hero: {
        alt: 'Export des données',
        imageSrc: 'https://x0zwu.mjt.lu/tplimg/x0zwu/b/x5zwm/vkxn4.png',
    },
    action: {
        message: 'Télécharger le fichier',
    },
    title: 'Export des données',
    preview: "Votre export des trajets en données ouvertes est disponible.",
    messageHTML: `
<p>
Votre export des trajets en données ouvertes est disponible.
Vous pouvez le télécharger en cliquant sur le bouton ci-dessous.
</p>      
<p>
Les données sont au format CSV et sont compressées dans un fichier ZIP.
</p>      
    `,
    messageText: `
Votre export des trajets en données ouvertes est disponible.
Vous pouvez le télécharger en cliquant sur le bouton ci-dessous.

Les données sont au format CSV et sont compressées dans un fichier ZIP.
    `,
};

export class ExportCSVNotification extends DefaultNotification {
    static readonly subject = 'Export des données';
    constructor(to: string, data: Partial<DefaultTemplateData>) {
        super(to, {
            ...defaultData,
            ...data,
        });
    }
}

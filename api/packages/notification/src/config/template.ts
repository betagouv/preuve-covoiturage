declare function env(key: string, fallback?: string): any;

export const templateDirectory = env('APP_TEMPLATE_DIRECTORY', './templates');
export const defaultSubject = 'Registre de preuve de covoiturage';

export const metadata = {
  invite: {
    subject: 'Invitation',
  },
  forgotten_password: {
    subject: 'Mot de passe oublié',
  },
};

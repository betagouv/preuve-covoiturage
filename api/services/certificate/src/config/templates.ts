declare function env(key: string, fallback?: string | boolean): any;

const apiUrl = env('APP_API_URL', 'http://localhost:8080');
const appUrl = env('APP_APP_URL', 'http://localhost:4200');

export const certificate = {
  apiUrl,
  appUrl,
  title: 'Attestation de covoiturage',
  contact: {
    url: 'https://covoiturage.beta.gouv.fr',
    email: 'contact@covoiturage.beta.gouv.fr',
  },
  validation: {
    url: `${appUrl}/certificates/check`,
  },
};

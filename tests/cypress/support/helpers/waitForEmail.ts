import axios from 'axios';

export interface Email {
  timestamp: number;
  text: string;
  SPF: string;
  dkim: string;
  attachments: [];
}

const endpoint = `https://api.testmail.app/api/json`;

function escapeRegExp(input: string): string {
  return input.replace(/[\.\*\+\?\^\$\{\}\(\)\|\[\]\\\/\:]/g, '\\$&');
}

function getParams(params: { [k: string]: string } = {}): string {
  return Object.entries({
    apikey: Cypress.env('TESTMAIL_APIKEY'),
    namespace: Cypress.env('TESTMAIL_NAMESPACE'),
    ...params,
  })
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
}

function getTagFromEmail(email: string): string {
  const regexp = new RegExp(
    `${escapeRegExp(Cypress.env('TESTMAIL_NAMESPACE'))}\\\.([a-zA-Z0-9]+)@inbox\\\.testmail\\\.app`,
  );
  const result = regexp.exec(email);
  if (!result) {
    throw new Error(`Cant find tag, invalid email ${email}`);
  }
  return result[1];
}

export function extractLinkFromEmail(emailText: string): string {
  if (!emailText) {
    throw new Error(`Invalid email payload (missing text)`);
  }

  const baseUrl = Cypress.config('baseUrl');
  const regexp = new RegExp(`\\\[(${escapeRegExp(baseUrl)}([^\\]]*))`);
  const result = regexp.exec(emailText);

  if (!result) {
    throw new Error(`Invalid email payload (missing url)`);
  }

  return result[1].replace(/[^a-z0-9:\/%.]/gi, '');
}

export async function waitForEmail(email: string, timestamp = Date.now()): Promise<Email> {
  const response = await axios.get(
    `${endpoint}?${getParams({
      tag: getTagFromEmail(email),
      timestamp_from: timestamp.toString(),
      livequery: 'true',
    })}`,
  );

  return response.data.emails[0];
}

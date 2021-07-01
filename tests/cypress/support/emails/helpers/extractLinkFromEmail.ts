import { escapeRegExp } from './escapeRegExp';

export function extractLinkFromEmail(baseUrl: string, emailText: string): string {
  if (!emailText || !emailText.length) {
    throw new Error(`Invalid email payload (missing text): ${emailText}`);
  }

  const regstr = `\\\[(${escapeRegExp(baseUrl)}([^\\]]*))`;
  const regexp = new RegExp(regstr);
  // remove ugly newlines from email spec
  const result = regexp.exec(emailText.replace(/\=(20)?[\n\r]+/g, ''));

  if (!result) {
    throw new Error(`URL not found in email body\n${baseUrl}\n\n\n${emailText}`);
  }

  return result[1].replace(/[^a-z0-9-_:;&#\?\/%.]/gi, '');
}

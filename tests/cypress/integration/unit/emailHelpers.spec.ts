import { extractLinkFromEmail } from '../../support/emails/helpers/extractLinkFromEmail';
import { escapeRegExp } from '../../support/emails/helpers/escapeRegExp';
import { getParams } from '../../support/emails/helpers/getParams';
import { inviteLocal } from './dummy-emails/inviteLocal';
import { inviteProduction } from './dummy-emails/inviteProduction';
import { forgottenLocal } from './dummy-emails/forgottenLocal';
import { exportLocal } from './dummy-emails/exportLocal';
import { forgottenCI } from './dummy-emails/forgottenCI';

describe('escapeRegExp', () => {
  it('makes the URL RegExp compatible', () => {
    const str = escapeRegExp('https://localhost:4200/api?a=query&b=ok');
    expect(str).to.eq('https\\:\\/\\/localhost\\:4200\\/api\\?a=query&b=ok');
  });
});

describe('getParams', () => {
  it('makes a query string from params', () => {
    expect(getParams({ a: 'query', b: 'ok' })).to.eq('a=query&b=ok');
  });
  it('removes undefined params', () => {
    expect(getParams({ a: 'query', b: 'ok', c: undefined })).to.eq('a=query&b=ok');
  });
  it('sorts params alphabetically', () => {
    expect(getParams({ z: 'end', a: 'query', b: 'ok' })).to.eq('a=query&b=ok&z=end');
  });
});

describe('extractLinkFromEmail', () => {
  it('finds the invite link (local)', () => {
    expect(extractLinkFromEmail('http://localhost:4200', inviteLocal)).to.eq(
      'http://localhost:4200/activate/jcduss%40example.com/Z3pIoi41tK4DyE1jYcJuErfJgElm2PzT',
    );
  });

  it('finds the invite link (prod)', () => {
    expect(extractLinkFromEmail('https://app.covoiturage.beta.gouv.fr', inviteProduction)).to.eq(
      'https://app.covoiturage.beta.gouv.fr/activate/jcduss%40example.com/Z3pIoi41tK4DyE1jYcJuErfJgElm2PzT',
    );
  });

  it('finds the forgotten link (local)', () => {
    expect(extractLinkFromEmail('http://localhost:4200', forgottenLocal)).to.eq(
      'http://localhost:4200/reset-forgotten-password/admin%40example.com/7V4gzz0DKnexvydSJKzlsqBBs8MZFOtS',
    );
  });

  it('finds the forgotten link (ci)', () => {
    expect(extractLinkFromEmail('https://app.covoiturage.test', forgottenCI)).to.eq(
      'https://app.covoiturage.test/reset-forgotten-password/admin%40example.com/WNnyOqIue2zKpkh36EyElPFGwQvq1qvc',
    );
  });

  it('finds the export link (s3)', () => {
    expect(extractLinkFromEmail('https://local-export.s3.fr-par.scw.cloud', exportLocal)).to.eq(
      'https://local-export.s3.fr-par.scw.cloud/covoiturage-0f58c4d9-395f-4e6f-917a-b42309fcc157.zip?X-Amz-Algorithm&#x3D;AWS4-HMAC-SHA256&amp;X-Amz-Credential&#x3D;SCWQTNRKSSN870FMW03H%2F20210624%2Ffr-par%2Fs3%2Faws4_request&amp;X-Amz-Date&#x3D;20210624T083525Z&amp;X-Amz-Expires&#x3D;604800&amp;X-Amz-Signature&#x3D;bc164ac12886c798fdef4f12903161442e528a67456659f4aaccee42a29b5e81&amp;X-Amz-SignedHeaders&#x3D;host&amp;response-content-disposition&#x3D;attachment%3B%20filename%3Dcovoiturage-0f58c4d9-395f-4e6f-917a-b42309fcc157.zip',
    );
  });
});

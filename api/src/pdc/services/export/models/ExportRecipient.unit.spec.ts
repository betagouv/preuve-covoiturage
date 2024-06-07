import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { ExportRecipient } from './ExportRecipient.ts';

it('should parse email with fullname', (t) => {
  assertObjectMatch(ExportRecipient.parseEmail('John Doe <jon.doe@example.com>'), {
    fullname: 'John Doe',
    email: 'jon.doe@example.com',
  });
});

it('should parse email with fullname with accents', (t) => {
  assertObjectMatch(ExportRecipient.parseEmail('Aimé Césaire <aime.cesaire@example.com>'), {
    fullname: 'Aimé Césaire',
    email: 'aime.cesaire@example.com',
  });
});

it('should parse email without fullname', (t) => {
  assertObjectMatch(ExportRecipient.parseEmail('jon.doe@example.com'), { fullname: null, email: 'jon.doe@example.com' });
});

it('should parse email without fullname with a plus sign', (t) => {
  assertObjectMatch(ExportRecipient.parseEmail('jon.doe+label@example.com'), {
    fullname: null,
    email: 'jon.doe+label@example.com',
  });
});

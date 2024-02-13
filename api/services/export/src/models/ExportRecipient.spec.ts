import test from 'ava';
import { ExportRecipient } from './ExportRecipient';

test('should parse email with fullname', (t) => {
  t.deepEqual(ExportRecipient.parseEmail('John Doe <jon.doe@example.com>'), {
    fullname: 'John Doe',
    email: 'jon.doe@example.com',
  });
});

test('should parse email with fullname with accents', (t) => {
  t.deepEqual(ExportRecipient.parseEmail('Aimé Césaire <aime.cesaire@example.com>'), {
    fullname: 'Aimé Césaire',
    email: 'aime.cesaire@example.com',
  });
});

test('should parse email without fullname', (t) => {
  t.deepEqual(ExportRecipient.parseEmail('jon.doe@example.com'), { fullname: null, email: 'jon.doe@example.com' });
});

test('should parse email without fullname with a plus sign', (t) => {
  t.deepEqual(ExportRecipient.parseEmail('jon.doe+label@example.com'), {
    fullname: null,
    email: 'jon.doe+label@example.com',
  });
});

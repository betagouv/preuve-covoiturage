import { Contact } from '~/core/entities/shared/contact';

import { Address, Company, Contacts, Territory } from '../../../src/app/core/entities/territory/territory';
import { territoryStub } from '../stubs/territory/territory.find';

export const expectedPatchedTerritory: Territory = new Territory({
  _id: territoryStub._id,
  name: 'AOM 1',
  shortname: 'AOM 1 shortname',
  company: new Company({
    siret: '123456789',
    naf_entreprise: '1234A',
  }),
  address: new Address({
    street: '5 rue de brest',
    postcode: '69002',
    city: 'Lyon',
    country: 'France',
  }),
  contacts: new Contacts({
    gdpr_controller: new Contact({
      firstname: 'Raymond',
      lastname: 'Breton',
      email: 'raymond.breton@aom.com',
    }),
    gdpr_dpo: new Contact({
      firstname: 'André',
      lastname: 'Jacques',
      email: 'andre@aom.com',
    }),
    technical: new Contact({
      firstname: 'Albert',
      lastname: 'Marcoeur',
      email: 'albert.marcoeur@aom.com',
      phone: '0673826458',
    }),
  }),
});

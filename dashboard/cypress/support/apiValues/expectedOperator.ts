import { Operator } from '~/core/entities/operator/operator';

import { operatorStub } from '../stubs/operator/operator.find';

export const expectedPatchedOperator: Operator = {
  _id: operatorStub._id,
  name: 'Opérateur',
  legal_name: 'Opérateur SAS',
  company: {
    siren: '123456789',
    naf_entreprise: '1234A',
  },
  address: {
    street: '5 rue de brest',
    postcode: '69002',
    city: 'Lyon',
    country: 'France',
  },
  contacts: {
    gdpr_controller: {
      firstname: 'Raymond',
      lastname: 'Breton',
      email: 'raymond.breton@aom.com',
    },
    gdpr_dpo: {
      firstname: 'André',
      lastname: 'Jacques',
      email: 'andre@aom.com',
    },
    technical: {
      firstname: 'Albert',
      lastname: 'Marcoeur',
      email: 'albert.marcoeur@aom.com',
      phone: '0673826458',
    },
  },
};

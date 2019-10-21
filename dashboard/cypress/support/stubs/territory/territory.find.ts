import { Address, Company, Territory } from '../../../../src/app/core/entities/territory/territory';

import { JsonRPCResponse } from '../../../../src/app/core/entities/api/jsonRPCResponse';

export const territoryStub: Territory = {
  _id: '5c66d89760e6ee004a6cab2f',
  name: 'AOM 1',
  acronym: 'Aom 1 acronym ',
  shortname: 'AOM 1 shortname',
  company: new Company({
    siren: '123456789',
    naf_entreprise: '1234A',
  }),
  address: new Address({
    street: '5 rue de brest',
    postcode: '69002',
    city: 'Lyon',
    country: 'France',
  }),
  contacts: {
    gdpr_controller: {
      firstname: 'Raymond',
      lastname: 'Breton',
      email: 'raymond.breton@aom.com',
    },
    gdpr_dpo: {
      firstname: 'Michelle',
      lastname: 'Planche',
      email: 'michelle.planche@aom.com',
    },
    technical: {
      firstname: 'Albert',
      lastname: 'Marcoeur',
      email: 'albert.marcoeur@aom.com',
      phone: '0673826458',
    },
  },
};

export function stubTerritoryFind() {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=territory:find',
    response: (data) =>
      <JsonRPCResponse[]>[
        {
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: territoryStub,
          },
        },
      ],
  });
}

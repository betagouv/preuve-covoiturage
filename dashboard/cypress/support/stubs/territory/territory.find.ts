import { Contact } from '~/core/entities/shared/contact';
import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';

import { Address, Company, Contacts, Territory } from '../../../../src/app/core/entities/territory/territory';

export const territoryStub: Territory = new Territory({
  _id: '5c66d89760e6ee004a6cab2f',
  name: 'AOM 1',
  shortname: 'AOM 1 shortname',
  company: new Company({
    siret: '12345678915654654',
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
      firstname: 'Michelle',
      lastname: 'Planche',
      email: 'michelle.planche@aom.com',
    }),
    technical: new Contact({
      firstname: 'Albert',
      lastname: 'Marcoeur',
      email: 'albert.marcoeur@aom.com',
      phone: '0673826458',
    }),
  }),
});

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

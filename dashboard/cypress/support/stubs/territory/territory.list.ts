import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';
import { Address, Company, Territory } from '~/core/entities/territory/territory';

import { territoryStub } from './territory.find';

export const territoryStubs: Territory[] = [
  territoryStub,
  {
    _id: '5d7775bf37043b8463b2a208',
    name: 'AOM 2',
    shortname: 'Aom acronym 2',
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
  },
];

export function stubTerritoryList() {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=territory:list',
    response: (data) =>
      <JsonRPCResponse[]>[
        {
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: territoryStubs,
          },
        },
      ],
  });
}

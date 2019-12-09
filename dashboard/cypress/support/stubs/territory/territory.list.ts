import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';
import { Address, Company, Territory } from '~/core/entities/territory/territory';

import { territoryStub } from './territory.find';

export const territoryStubs: Territory[] = [
  territoryStub,
  new Territory({
    _id: 2,
    name: 'AOM 2',
    siret: '123456789',
    shortname: 'Aom shortname 2',
    company: new Company({
      naf_entreprise: '1234A',
    }),
    address: new Address({
      street: '5 rue de brest',
      postcode: '69002',
      city: 'Lyon',
      country: 'France',
    }),
  }),
  new Territory({
    _id: 3,
    name: 'AOM 3',
    shortname: 'Aom acronym 3',
    siret: '123456789',

    company: new Company({
      naf_entreprise: '1234A',
    }),
    address: new Address({
      street: '5 rue de brest',
      postcode: '69002',
      city: 'Lyon',
      country: 'France',
    }),
  }),
  new Territory({
    _id: 4,
    name: 'AOM 4',
    shortname: 'Aom acronym 4',
    siret: '123456789',

    company: new Company({
      naf_entreprise: '1234A',
    }),
    address: new Address({
      street: '5 rue de brest',
      postcode: '69002',
      city: 'Lyon',
      country: 'France',
    }),
  }),
  new Territory({
    _id: 5,
    name: 'AOM 5',
    shortname: 'Aom acronym 5',
    siret: '123456789',

    company: new Company({
      naf_entreprise: '1234A',
    }),
    address: new Address({
      street: '5 rue de brest',
      postcode: '69002',
      city: 'Lyon',
      country: 'France',
    }),
  }),
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

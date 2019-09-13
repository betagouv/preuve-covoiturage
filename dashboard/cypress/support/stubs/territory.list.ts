import { Address, Company, Territory } from '../../../src/app/core/entities/territory/territory';

export const territoryStubs: Territory[] = [
  {
    _id: '5c66d89760e6ee004a6cab1f',
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
  },
  {
    _id: '5d7775bf37043b8463b2a208',
    name: 'AOM 2',
    acronym: 'Aom acronym 2',
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
  },
];

export function stubTerritoryList() {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=territory.list',
    response: (data) => ({
      payload: {
        data: [
          {
            id: 1568215196898,
            jsonrpc: '2.0',
            result: territoryStubs,
          },
        ],
      },
    }),
  });
}

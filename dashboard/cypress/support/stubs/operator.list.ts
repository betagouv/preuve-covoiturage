import { Operator } from '../../../src/app/core/entities/operator/operator';
import { JsonRPCResponse } from '../../../src/app/core/entities/api/jsonRPCResponse';

export const operatorStubs: Operator[] = [
  {
    _id: '5c66d89760e6ee004a6cab1f',
    nom_commercial: 'Opérateur',
    raison_sociale: 'Opérateur SAS',
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
  },
  {
    _id: '5c66d89760e6ee004a6cab4g',
    nom_commercial: 'Opérateur 2',
    raison_sociale: 'Opérateur 2 SAS',
    company: {
      siren: '123456789',
      naf_entreprise: '1234A',
    },
    address: {
      street: '2 rue de brest',
      postcode: '69002',
      city: 'Lyon',
      country: 'France',
    },
  },
];

export function stubOperatorList() {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=operator:list',
    response: (data) =>
      <JsonRPCResponse[]>[
        {
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: operatorStubs,
          },
        },
      ],
  });
}

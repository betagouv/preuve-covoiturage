import { requests } from '../../support/requests';

before(() => {
  // throw new Error(JSON.stringify(requests));
  for (const [textBinding, [binding, method]] of requests) {
    cy.log(`binding "${method}" request to "${binding} (${textBinding})"`);

    cy.intercept({
      pathname: '/rpc',
      method: 'POST',
      query: { methods: method },
    }).as(binding);
  }
});

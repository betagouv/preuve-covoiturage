import { requests } from '../../support/requests';

before(function () {
  for (const [textBinding, [binding, method]] of requests) {
    cy.log(`binding "${method}" request to "${binding} (${textBinding})"`);

    cy.intercept({
      pathname: '/rpc',
      method: 'POST',
      query: { methods: method },
    }).as(binding);
  }
});

const { requests } = require('../../support/requests.js');

before(() => {
    cy.log(
      "This will run once before all tests, you can use this to for example start up your server, if that's your thing"
    );

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
const { Given } = require('cypress-cucumber-preprocessor/steps');

const usersCredentials = new Map([
  ['administrateur du registre', {
    login: process.env.REGISTRY_ADMIN_USERNAME,
    password: process.env.REGISTRY_ADMIN_PASSWORD,
  }],
]);

Given('je suis connecté.e comme {string}', (userType) => {
  if (!usersCredentials.has(userType)) {
    throw new Error(`Cant find user of type ${userType}`);
  }

  const { login, password } = usersCredentials.get(userType);
  cy.login(login, password);
});

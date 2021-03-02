import { defineParameterType } from 'cypress-cucumber-preprocessor/steps';

const usersCredentials = new Map([
  [
    'administrateur du registre',
    {
      login: process.env.REGISTRY_ADMIN_USERNAME ?? 'admin@example.com',
      password: process.env.REGISTRY_ADMIN_PASSWORD ?? 'admin1234',
    },
  ],
]);

defineParameterType({
  name: 'userType',
  regexp: new RegExp(Array.from(usersCredentials.keys()).join('|')),
  transformer: (userType) => usersCredentials.get(userType),
});

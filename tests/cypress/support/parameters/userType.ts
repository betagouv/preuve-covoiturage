import { defineParameterType } from 'cypress-cucumber-preprocessor/steps';
import { usersCredentials, getUserCredentials } from '../helpers/getUserCredentials';

defineParameterType({
  name: 'userType',
  regexp: new RegExp(Array.from(usersCredentials.keys()).join('|')),
  transformer: (userType) => getUserCredentials(userType),
});

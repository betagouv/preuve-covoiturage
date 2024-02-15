/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

const { genServices } = require('./services');
const { genProviders } = require('./providers');
const { genApiLicenses } = require('./licenses');

const config = {
  root: path.resolve(__dirname, '..'),
  providersRoot: path.resolve(__dirname, '../../api/providers'),
  servicesRoot: path.resolve(__dirname, '../../api/services'),
};

// copy README.md and append a list of actions
// from all api/services/*
console.debug('📚 [apidoc:gen] Generate doc for services');
genServices(config);

// from all api/providers/*
console.debug('📚 [apidoc:gen] Generate doc for providers');
genProviders(config);

// generate a table of all dependencies licenses
console.debug('📚 [apidoc:gen] Generate list of licenses');
genApiLicenses(config);

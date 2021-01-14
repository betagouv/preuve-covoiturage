const path = require('path');

const { genServices } = require('./services');
const { genApiLicenses } = require('./licenses');

const config = {
  root: path.resolve(__dirname, '..'),
  providersRoot: path.resolve(__dirname, '../../api/providers'),
  servicesRoot: path.resolve(__dirname, '../../api/services'),
};

// copy README.md and append a list of actions
// from all api/services/*
console.log('📚 [apidoc:gen] Generate doc for services');
genServices(config);

// generate a table of all dependencies licenses
console.log('📚 [apidoc:gen] Generate list of licenses');
genApiLicenses(config);

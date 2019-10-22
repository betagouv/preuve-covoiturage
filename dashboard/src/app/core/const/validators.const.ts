export const REGEXP = {
  phone: /^(?:(?:\+|00)33|0)(\s*\(0\))?\s*[1-9](?:[\s.-]*\d{2}){4}$/,
  email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, // tslint:disable max-line-length
  insee: /^[0-9][0-9AB][0-9]{3}$/,
  siren: /^[0-9]{9}$/,
  siret: /^[0-9]{14}$/,
  naf: /^[0-9]{4}[A-Z]{1}$/,
  nic: /^[0-9]{5}$/,
  vatIntra: /^[A-Z]{2}[A-Z0-9]{2}[0-9]{9}$/,
  postcode: /^[0-9][0-9AB][0-9]{3}$/,
  cedex: /^[0-9]{5}$/,
  lon: /^-?[0-9]{1,3}(\.[0-9]+)?$/,
  lat: /^-?[0-9]{1,2}(\.[0-9]+)?$/,
  iban: /^(?:(?:IT|SM)\d{2}[A-Z]\d{22}|CY\d{2}[A-Z]\d{23}|NL\d{2}[A-Z]{4}\d{10}|LV\d{2}[A-Z]{4}\d{13}|(?:BG|BH|GB|IE)\d{2}[A-Z]{4}\d{14}|GI\d{2}[A-Z]{4}\d{15}|RO\d{2}[A-Z]{4}\d{16}|KW\d{2}[A-Z]{4}\d{22}|MT\d{2}[A-Z]{4}\d{23}|NO\d{13}|(?:DK|FI|GL|FO)\d{16}|MK\d{17}|(?:AT|EE|KZ|LU|XK)\d{18}|(?:BA|HR|LI|CH|CR)\d{19}|(?:GE|DE|LT|ME|RS)\d{20}|IL\d{21}|(?:AD|CZ|ES|MD|SA)\d{22}|PT\d{23}|(?:BE|IS)\d{24}|(?:FR|MR|MC)\d{25}|(?:AL|DO|LB|PL)\d{26}|(?:AZ|HU)\d{27}|(?:GR|MU)\d{28})$/, // tslint:disable max-line-length
  bic: /([a-zA-Z]{4}[a-zA-Z]{2}[a-zA-Z0-9]{2}([a-zA-Z0-9]{3})?)/,
};

export const PASSWORD = {
  min: 6,
  max: 128,
};

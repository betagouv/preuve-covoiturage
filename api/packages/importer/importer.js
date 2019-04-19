/* eslint-disable no-param-reassign */
const _ = require('lodash');
const fs = require('fs');
const chardet = require('chardet');
const parse = require('csv-parse/lib/sync');
const Journey = require('@pdc/service-acquisition/entities/models/journey');
const cast = require('./lib/cast');
const validators = require('./validators');

/**
 * CSV authorized headers
 *
 * @type {string[]}
 */
const headers = [
  'journey_id',
  'operator_journey_id',
  'operator_class',
  'passenger.identity.firstname',
  'passenger.identity.lastname',
  'passenger.identity.email',
  'passenger.identity.phone',
  'passenger.identity.company',
  'passenger.identity.over_18',
  'passenger.identity.card.name',
  'passenger.identity.card.number',
  'passenger.start.datetime',
  'passenger.start.lat',
  'passenger.start.lon',
  'passenger.start.insee',
  'passenger.start.literal',
  'passenger.end.datetime',
  'passenger.end.lat',
  'passenger.end.lon',
  'passenger.end.insee',
  'passenger.end.literal',
  'passenger.seats',
  'passenger.contribution',
  'passenger.distance',
  'passenger.duration',
  'driver.identity.firstname',
  'driver.identity.lastname',
  'driver.identity.email',
  'driver.identity.phone',
  'driver.identity.company',
  'driver.identity.card.name',
  'driver.identity.card.number',
  'driver.start.datetime',
  'driver.start.lat',
  'driver.start.lon',
  'driver.start.insee',
  'driver.start.literal',
  'driver.end.datetime',
  'driver.end.lat',
  'driver.end.lon',
  'driver.end.insee',
  'driver.end.literal',
  'driver.revenue',
  'driver.distance',
  'driver.duration',
];

/**
 * Detect encoding from a file
 *
 * @param {string} path
 * @return {string}
 */
const detectEncoding = (path) => {
  const enc = chardet.detectFileSync(path);
  switch (enc) {
    case 'ISO-8859-1':
    case 'ISO-8859-2':
      return 'latin1';
    default:
      return 'utf8';
  }
};

/**
 * Detect the delimiter by counting occurences of known delimiters
 *
 * @param {string} file
 * @return {string}
 */
const detectDelimiter = (file) => {
  const line = file.substr(0, file.indexOf('\n'));
  return [',', ';']
    .reduce((p, c) => {
      const res = line.replace(new RegExp(`[^${c}]`, 'g'), '');
      if (res.length) p[res.length] = c;
      return p;
    }, [])
    .pop() || ',';
};

module.exports = {
  /**
   * Run registered validators
   *
   * @param {MulterFile} file
   * @param {String[]} lines
   * @throws {Error}
   */
  validate(file, lines) {
    if (!file) {
      throw new Error('Not a proper file');
    }

    [
      validators.isEmptyFile,
      validators.isCsvFile,
      validators.rightNumberOfColumns,
    ].forEach(fn => fn({ file, headers, lines }));
  },

  /**
   * Read the CSV file with the correct encoding
   *
   * @param path
   * @return {any | never}
   */
  read({ path }) {
    const file = fs.readFileSync(path, { encoding: detectEncoding(path) });
    const delimiter = detectDelimiter(file);
    return parse(file, { delimiter });
  },

  /**
   * run the importer
   *
   * @param {Object} service
   * @param {Object} operator
   * @param {string} lines
   * @return {Promise<{data: {imported: Array, failed: Array}}>}
   */
  async exec(service, operator, lines) {
    const promises = [];
    const failed = [];

    lines.forEach((line, idx) => {
      const j = {};
      for (let i = 0; i < headers.length; i += 1) {
        if (line[i] !== '') {
          const data = cast(headers, line, i);

          if (!_.isNil(data) && data !== '') {
            _.set(j, headers[i], data);
          }
        }
      }

      const candidate = new Journey(j);
      const err = candidate.validateSync();

      if (err) {
        failed.push({
          journey_id: j.journey_id,
          line: idx + 1,
          errors: _.reduce(err.errors, (p, c, k) => {
            if (c.errors === undefined) {
              p[k] = _.get(c, 'reason.message', _.get(c, 'message', ''))
                .replace(/["`]/g, "'");
            }
            return p;
          }, {}),
        });
      } else {
        promises.push(service.create(j, operator).catch((createError) => {
          const errors = {};
          errors[`${createError.name} ${createError.code}`] = createError.message;

          failed.push({
            journey_id: j.journey_id,
            line: idx + 1,
            errors,
          });
        }));
      }
    });

    const imported = await Promise.all(promises);

    return {
      imported,
      failed,
    };
  },
};

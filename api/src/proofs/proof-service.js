const _ = require('lodash');
const { Schema } = require('mongoose');
const { CsvConverter } = require('@pdc/proof-helpers');
const config = require('@pdc/config');
const aomService = require('../aom/aom-service');
const Proof = require('./proof-model');
const proofEvent = require('./events');
const { isValid, ...validationTests } = require('./validation/service');

const proofService = {
  find(query = {}) {
    return Proof.find(query);
  },

  async update(id, data) {
    const proof = await Proof.findByIdAndUpdate(id, data, { new: true });
    proofEvent.emit('change', this, proof);

    return proof;
  },

  async create(data) {
    const proof = new Proof(data);
    await proof.save();

    proofEvent.emit('change', this, proof);

    return proof;
  },

  async delete(id) {
    return Proof.findByIdAndUpdate(id, { deletedAt: Date.now() });
  },

  async convert(docs, format = 'csv') {
    // convert to an array based on configuration file
    let arr = [];
    const proofs = docs.map((proof) => {
      arr = [];
      config.proofsCsv.headers.forEach((cfg) => {
        arr.push(_.get(proof, cfg.path, ''));
      });

      return arr;
    });

    // output in required format
    switch (format) {
      case 'csv':
        return (new CsvConverter(proofs, config.proofsCsv)).convert();

      default:
        throw new Error('Unsupported format');
    }
  },

  /**
   * Enrich a proof with additional data
   *
   * @param userProof
   * @returns {Promise<*>}
   */
  async enrich(userProof) {
    const proof = (await this.getProof(userProof)).toJSON();

    // the list of all touched AOM during the journey
    // journey_span for each AOM is a percentage of the journey
    // which is done in each AOM
    const queries = [
      proof.start,
      proof.end,
    ].reduce((p, c) => {
      const query = {};
      if (_.has(c, 'lat')) query.lat = c.lat;
      if (_.has(c, 'lng')) query.lng = c.lng;
      if (_.has(c, 'insee')) query.insee = c.insee;
      if (Object.keys(query).length) p.push(query);

      return p;
    }, []);

    const aomList = (await Promise.all(queries.map(aomService.search)))
      .map(i => i.toJSON())
      .map(i => _.assign(i, {
        id: `${i._id}`,
        journey_span: 100, // TODO
      }));

    return Proof.findByIdAndUpdate(proof._id, { aom: _.uniqBy(aomList, 'id') }, { new: true });
  },

  async validate(proof) {
    // run tests and order in list of testnames with results
    const validation = await Object.keys(validationTests).reduce(async (list, k) => {
      // eslint-disable-next-line no-param-reassign
      list[_.snakeCase(k)] = await validationTests[k](proof);

      return list;
    }, {});

    // compute the validation state based on the results of
    // all tests
    const validated = isValid(validation);

    // find and update proof
    return Proof.findByIdAndUpdate(proof._id, {
      validated,
      validation,
      validatedAt: validated ? Date.now() : null,
    }, { new: true });
  },

  /**
   * get the Proof object from database
   *
   * @param proof
   * @returns {Promise<*>}
   */
  async getProof(proof) {
    if (proof instanceof Proof) {
      return proof;
    }

    if (proof instanceof Schema.Types.ObjectId || _.isString(proof)) {
      return Proof.findOne({ _id: proof });
    }

    throw new Error('Unsupported Proof format, please pass a Proof object or a _id as String');
  },
};

module.exports = proofService;

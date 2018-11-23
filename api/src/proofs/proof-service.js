const _ = require("lodash");
const Proof = require("./proof-model");
const { CsvConverter } = require("@pdc/proof-helpers");
const config = require("@pdc/config");
const aomService = require("../aom/aom-service");

const proofService = {
  find(query = {}) {
    return Proof.find(query);
  },

  async update(id, data) {
    const proof = await Proof.findOneAndUpdate({ _id: id }, data, { new: true });

    // TODO move this to background job
    this.enrich(proof);

    return proof;
  },

  async create(data) {
    const proof = new Proof(data);
    await proof.save();

    // TODO move this to background job
    this.enrich(proof);

    return proof;
  },

  async delete(id) {
    return await Proof.findOneAndUpdate({ _id: id }, { deletedAt: Date.now() });
  },

  async convert(docs, format = 'csv') {
    // convert to an array based on configuration file
    let _arr = [];
    const proofs = docs.map((proof) => {
      _arr = [];
      config.proofsCsv.headers.forEach((cfg) => {
        _arr.push(_.get(proof, cfg.path, ""));
      });

      return _arr;
    });

    // output in required format
    switch (format) {
      case 'csv':
        const csv = new CsvConverter(proofs, config.proofsCsv);
        return await csv.convert();

      default:
        throw new Error('Unsupported format');
    }
  },

  /**
   * Enrich a proof with additional data
   *
   * @param proof
   * @returns {Promise<*>}
   */
  async enrich(proof) {
    proof = (await this.getProof(proof)).toJSON();

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

    return await Proof.findOneAndUpdate({ "_id": `${proof._id}` }, _.assign(
      proof,
      { aom: _.uniqBy(aomList, "id") },
    ));
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
      return await Proof.findOne({ "_id": proof });
    }

    throw new Error("Unsupported Proof format, please pass a Proof object or a _id as String");
  }
};

module.exports = proofService;

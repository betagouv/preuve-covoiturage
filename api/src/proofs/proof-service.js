const _ = require("lodash");
const Proof = require("./proof-model");
const { CsvConverter } = require("@pdc/proof-helpers");
const config = require("@pdc/config");

const proofService = {
  find(query = {}) {
    return Proof.find(query);
  },

  async update(id, data) {
    return await Proof.findOneAndUpdate({ _id: id }, data, { new: true });
  },

  async create(data) {
    const proof = new Proof(data);
    return await proof.save();
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
  }
};

module.exports = proofService;

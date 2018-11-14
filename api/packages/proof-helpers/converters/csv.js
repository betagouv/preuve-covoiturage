const _ = require("lodash");
const { stringify } = require("csv");
const promisify = require("@pdc/promisify");

class CsvConverter {
  /**
   * Build CsvConverter with array of data.
   * Each row is an array.
   *
   *
   *
   * @param data
   * @param config
   */
  constructor(data = null, config = {}) {
    this.data = data;
    this.config = _.assign({
      headers: [],
    }, config);
  }

  async convert() {
    if (!this.data.length) {
      throw new Error("No data to convert");
    }

    return await CsvConverter.stringify(this.data, {
      columns: _.map(this.config.headers, 'name'),
      header: true,
      quotedEmpty: true,
      quotedString: true,
    });
  }

  static stringify(data, options) {
    return promisify(stringify, data, options);
  }
}

module.exports = CsvConverter;

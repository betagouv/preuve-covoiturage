module.exports = {
  /**
   * Check if the file is empty
   *
   * @param file
   * @param headers
   */
  isEmptyFile({ file }) {
    if (file.size < 100) {
      throw new Error('Empty file');
    }
  },

  /**
   * Check if the file is a csv
   *
   * @param {MulterFile} file
   */
  isCsvFile({ file }) {
    const mimetypes = [
      'text/csv',
      'text/x-csv',
      'text/plain',
      'application/vnd.ms-excel',
    ];

    if (!file.mimetype) {
      throw new Error('Missing Mime type');
    }

    if (mimetypes.indexOf(file.mimetype) === -1) {
      throw new Error(`Wrong Mime type: ${file.mimetype}`);
    }
  },

  /**
   * Check the number of columns based on the delimiters' count
   *
   * @param {Array} headers
   * @param {Array} lines
   * @throws {Error}
   */
  rightNumberOfColumns({ headers, lines }) {
    const len = lines[0] ? lines[0].length : 0;

    if (len !== headers.length) {
      throw new Error(`Number of columns must be ${headers.length}, ${len} given`);
    }
  },
};

module.exports = {
  isCsvFile(multexFileObject) {
    if (!multexFileObject) {
      return false;
    }

    const mimetypes = [
      'text/csv',
    ];

    if (!multexFileObject.mimetype
      || mimetypes.indexOf(multexFileObject.mimetype) === -1) {
      return false;
    }

    return true;
  },
};

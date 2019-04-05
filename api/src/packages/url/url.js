const normalizeUrl = require('normalize-url');

module.exports = {
  appUrl(queryString) {
    const base = process.env.APP_URL || '/';

    return normalizeUrl(`${base}/${queryString}`);
  },
  apiUrl(queryString) {
    const base = process.env.API_URL || '/';

    return normalizeUrl(`${base}/${queryString}`);
  },
};

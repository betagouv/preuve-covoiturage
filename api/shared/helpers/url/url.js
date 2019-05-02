const normalizeUrl = require('normalize-url');

const cleanUrl = (baseUrl, baseOptions) => (queryString = '', opts = {}) => {
  const options = {
    allowNull: false,
    ...opts,
  };

  // get URL from fallback if missing
  if (!baseUrl) {
    // return null if no fallback and user is Okay with that
    if (!baseOptions.fallback) {
      return options.allowNull ? null : '/';
    }

    const base = baseOptions.fallback.replace(baseOptions.replace[0], baseOptions.replace[1]);

    return normalizeUrl(`${base}/${queryString}`);
  }

  return normalizeUrl(`${baseUrl || '/'}/${queryString}`);
};

module.exports = (app, api) => ({
  appUrl: cleanUrl(app, { fallback: api, replace: ['api', 'dashboard'] }),
  apiUrl: cleanUrl(api, { fallback: app, replace: ['dashboard', 'api'] }),
});

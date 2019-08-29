/* eslint-disable no-shadow */
const _ = require('lodash');
const axios = require('axios');

const route = async (start, end) => new Promise((resolve, reject) => {
  const url = 'http://osrm.covoiturage.beta.gouv.fr:5000';
  const query = `${start.lon},${start.lat};${end.lon},${end.lat}`;

  axios
    .get(`${url}/route/v1/driving/${encodeURIComponent(query)}`)
    .then((res) => {
      const route = _.get(res, 'data.routes', [{}])[0];
      const distance = _.get(route, 'distance', null);
      const duration = _.get(route, 'duration', null);

      if (!distance || !duration) reject();
      else resolve({ distance, duration });
    })
    .catch(reject);
});

module.exports = { route };

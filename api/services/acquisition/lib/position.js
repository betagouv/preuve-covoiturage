const _ = require('lodash');
const geo = require('@pdc/package-geo/geo');
const BadRequestError = require('@pdc/shared/errors/bad-request');

const processTownResponse = ({ jrn, path, pos }) => async ({
  town,
  postcodes,
  insee,
  country,
  lon,
  lat,
}) => {
  const position = Object.assign({}, pos);
  const journey = Object.assign({}, jrn);

  if (lon && !position.lon) {
    position.lon = lon;
    _.set(journey, `${path}.lon`, lon);
  }

  if (lat && !position.lat) {
    position.lat = lat;
    _.set(journey, `${path}.lat`, lat);
  }

  if (insee && !position.insee) {
    position.insee = insee;
    _.set(journey, `${path}.insee`, insee);
  }

  if (town && !position.town) {
    position.town = town;
    _.set(journey, `${path}.town`, town);
  }

  if (country && !position.country) {
    position.country = country;
    _.set(journey, `${path}.country`, country);
  }

  // concat postcodes with existing ones
  const pcs = _.get(jrn, `${path}.postcodes`, []).concat(postcodes);
  position.postcodes = _.uniq(pcs);
  _.set(journey, `${path}.postcodes`, position.postcodes);

  return { journey, path, position };
};

const pathToPosition = async ({ journey, path }) => {
  const pos = _.get(journey, path);

  if (!pos) {
    throw new BadRequestError(`Missing position data in ${journey._id}`);
  }

  return { journey, path, position: pos || {} };
};

const findTown = async ({ journey, path, position }) => {
  const pos = Object.assign({}, position);
  const jrn = Object.assign({}, journey);

  return geo
    .town({ lon: pos.lon, lat: pos.lat, insee: pos.insee, literal: pos.literal })
    .then(processTownResponse({ jrn, path, pos }));
  // if (
  //   (_.get(position, 'lat', null) !== null
  //   && _.get(position, 'lon', null) !== null)
  //   || _.get(position, 'literal', null) !== null
  // ) {
  //   return geo
  //     .town({ lon: pos.lon, lat: pos.lat, literal: pos.literal })
  //     .then(processTownResponse({ jrn, path, pos }));
  // }
  //
  // return { journey, path, position };
};

const findTownByInsee = async ({ journey, path, position }) => {
  const pos = Object.assign({}, position);
  const jrn = Object.assign({}, journey);

  if (_.get(position, 'insee', null) !== null) {
    return geo
      .town({ insee: pos.insee })
      .then(processTownResponse({ jrn, path, pos }));
  }

  return { journey, path, position };
};

const findAomFromPosition = async ({ journey, path, position }) => {
  const pos = Object.assign({}, position);
  const jrn = Object.assign({}, journey);

  const aom = await geo.aom({
    lat: position.lat,
    lon: position.lon,
    insee: position.insee,
  });

  if (aom) {
    const obj = aom.toObject();
    pos.aom = obj;
    _.set(jrn, `${path}.aom`, obj);
  }

  return { journey: jrn, path, position: pos };
};

module.exports = {
  pathToPosition,
  findTown,
  findTownByInsee,
  findAomFromPosition,
};

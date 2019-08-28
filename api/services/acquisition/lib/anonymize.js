const round = (num, p = 4) => {
  const factor = 10 ** p;
  return Math.round(num * factor) / factor;
};

const anonymize = (line) => {
  const filtered = { ...line };

  filtered['passenger.start.datetime'] = new Date(filtered['passenger.start.datetime']).toISOString();
  filtered['passenger.end.datetime'] = new Date(filtered['passenger.end.datetime']).toISOString();
  filtered['driver.start.datetime'] = new Date(filtered['driver.start.datetime']).toISOString();
  filtered['driver.end.datetime'] = new Date(filtered['driver.end.datetime']).toISOString();

  filtered['passenger.start.lon'] = round(filtered['passenger.start.lon']);
  filtered['passenger.start.lat'] = round(filtered['passenger.start.lat']);
  filtered['passenger.end.lon'] = round(filtered['passenger.end.lon']);
  filtered['passenger.end.lat'] = round(filtered['passenger.end.lat']);

  filtered['driver.start.lon'] = round(filtered['driver.start.lon']);
  filtered['driver.start.lat'] = round(filtered['driver.start.lat']);
  filtered['driver.end.lon'] = round(filtered['driver.end.lon']);
  filtered['driver.end.lat'] = round(filtered['driver.end.lat']);

  return filtered;
};

module.exports = { anonymize };

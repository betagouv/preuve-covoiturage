module.exports = (headers, line, i) => {
  let data = {};

  switch (headers[i]) {
    case 'passenger.identity.over_18':
      data = line[i].toLowerCase() === 'true'
        || line[i].toLowerCase() === '1';
      break;

    case 'passenger.start.lat':
    case 'passenger.start.lon':
    case 'passenger.end.lat':
    case 'passenger.end.lon':
    case 'driver.start.lat':
    case 'driver.start.lon':
    case 'driver.end.lat':
    case 'driver.end.lon':
      data = parseFloat(line[i]);
      break;

    case 'passenger.seats':
    case 'passenger.cost':
    case 'passenger.distance':
    case 'passenger.duration':
    case 'driver.cost':
    case 'driver.distance':
    case 'driver.duration':
      data = parseInt(line[i], 10);
      break;

    default:
      data = line[i];
  }

  return data;
};

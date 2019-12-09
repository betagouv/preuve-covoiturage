const { get } = require('lodash');

const [_, script, ...payloads] = process.argv;

const mapper = (doc, index) => {
  try {
    const json = JSON.parse(doc.substr(1, doc.length - 2).replace(/\\"/g, '"'));

    if (typeof json.operator === 'object') {
      json['operator_id'] = get(json, 'operator._id');
    }

    json.driver.incentives = [];
    json.driver.payments = [];
    json.passenger.incentives = [];
    json.passenger.payments = [];

    if (typeof json.operator_id === 'object' && '$oid' in json.operator_id) json.operator_id = json.operator_id['$oid'];
    json.passenger.start.datetime = json.passenger.start.datetime['$date'];
    json.passenger.end.datetime = json.passenger.end.datetime['$date'];
    json.driver.start.datetime = json.driver.start.datetime['$date'];
    json.driver.end.datetime = json.driver.end.datetime['$date'];

    delete json._id;
    delete json.__v;
    delete json.operator;
    delete json.createdAt;
    delete json.updatedAt;
    delete json.duplicatedAt;
    delete json.passenger.start.postcodes;
    delete json.passenger.end.postcodes;
    delete json.driver.start.postcodes;
    delete json.driver.end.postcodes;
    delete json.passenger.start.aom;
    delete json.passenger.end.aom;
    delete json.driver.start.aom;
    delete json.driver.end.aom;
    delete json.aom;
    delete json.safe_journey_id;
    delete json.trip_id;
    delete json._upgrade_metadata;
    delete json.validation;
    delete json.status;
    delete json.deletedAt;

    const payload = JSON.stringify(json).replace(/([a-z\"])'([a-z\"])/gi, "$1''$2");

    return `INSERT INTO acquisition.acquisitions
		( operator_id, application_id, journey_id, payload )
		VALUES ('${json.operator_id}', 'unknown', '${json.journey_id}', '${payload}');
	`
      .replace(/\n/g, ' ')
      .replace(/\t/g, '');
  } catch (e) {
    console.log('ERROR', e.message);
    console.log(doc);
    process.exit(1);
  }
};

console.log(payloads.map(mapper).join('\n'));

/* eslint-disable camelcase */
const Journey = require('@pdc/service-acquisition/entities/models/journey');
const SafeJourney = require('@pdc/service-acquisition/entities/models/safe-journey');
const journeyService = require('@pdc/service-acquisition/service');
const tripService = require('@pdc/service-trip/service');
const { journeysQueue } = require('./queues');
const NotFoundError = require('../errors/not-found');

const onCreate = async (db, job) => {
  const safeJourney = await SafeJourney.findById(job.data.safe_journey_id).exec();

  if (!safeJourney) {
    throw new NotFoundError(`onCreate Safe Journey not found (${job.data.safe_journey_id})`);
  }

  // duplicate from safe-journeys to journeys
  let duplicate = await journeyService.duplicateFromSafe(safeJourney, job.data.operator);

  // fill-out missing coordinates and bind AOMs
  duplicate = await journeyService.fillOutCoordinates(duplicate);

  // consolidate trip
  await tripService.consolidate(duplicate);

  const jid = duplicate._id.toString();

  // clear planned step1 and step2 validations
  const existingJobs = await journeysQueue.getDelayed();
  existingJobs.forEach((existingJob) => {
    const { type, journey_id } = existingJob.data;
    if (['step-1', 'step-2'].indexOf(type) && jid === journey_id) {
      existingJob.remove();
    }
  });

  // schedule next validations
  if (process.env.NODE_ENV !== 'test') {
    // set immediate tests
    journeysQueue.add(`${duplicate.operator.nom_commercial} - step-0`, {
      type: 'step-0',
      journey_id: jid,
    }, { delay: 1000 });

    // set delayed 24h (24 * 3600)
    journeysQueue.add(`${duplicate.operator.nom_commercial} - step-1`, {
      type: 'step-1',
      journey_id: jid,
    }, { delay: (process.env.JOURNEY_DELAY_1 || 86400) * 1000 });

    // set delayed 48h (48 * 3600)
    journeysQueue.add(`${duplicate.operator.nom_commercial} - step-2`, {
      type: 'step-2',
      journey_id: jid,
    }, { delay: (process.env.JOURNEY_DELAY_2 || 172800) * 1000 });
  }

  return {
    _id: duplicate._id.toString(),
    status: duplicate.status,
  };
};

const onValidate = async (db, job) => {
  const step = parseInt(String(job.data.type).replace('step-', ''), 10);

  return journeyService.validate(
    await Journey.findOne({ _id: job.data.journey_id }).exec(),
    step,
  );
};

const onProcess = async (db, job) => {
  const journey = await journeyService.process({
    safe_journey_id: job.data.safe_journey_id,
  });

  const trip = await tripService.consolidate(journey);

  return { journey, trip };
};

const onProcessTrip = async (db, job) => {
  const journey = await journeyService.findOne(job.data.journey_id);
  const trip = await tripService.consolidate(journey);

  return { journey, trip };
};

module.exports = db => async (job) => {
  let res;

  switch (job.data.type) {
    case 'create':
      res = await onCreate(db, job);
      break;
    case 'step-0':
    case 'step-1':
    case 'step-2':
      res = await onValidate(db, job);
      break;
    case 'process':
      res = await onProcess(db, job);
      break;
    case 'process-trip':
      res = await onProcessTrip(db, job);
      break;
    default:
      throw new Error(`Unsupported '${job.data.type}' type`);
  }

  return res;
};

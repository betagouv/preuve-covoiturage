const BadRequestError = require('../../packages/errors/bad-request');
const NotFoundError = require('../../packages/errors/not-found');
const { journeysQueue } = require('../../worker/queues');

const onCreate = ({ journey, operator }) => {
  if (!journey) {
    throw new BadRequestError();
  }

  if (!operator) {
    throw new NotFoundError('Operator not found');
  }

  journeysQueue.add(`${operator.nom_commercial} - create`, {
    type: 'create',
    operator: operator._id.toString(),
    safe_journey_id: journey._id.toString(),
  });
};

module.exports = {
  create: onCreate,
};

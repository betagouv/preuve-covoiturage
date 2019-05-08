const BadRequestError = require('@pdc/shared/errors/bad-request');
const NotFoundError = require('@pdc/shared/errors/not-found');
const journeysQueue = require('../queue');

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

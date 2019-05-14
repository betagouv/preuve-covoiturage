const { BadRequestError, NotFoundError } = require('@pdc/shared-errors');
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

export default {
  create: onCreate,
};

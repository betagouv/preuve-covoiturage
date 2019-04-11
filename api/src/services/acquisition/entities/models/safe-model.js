const modelFactory = require('../../shared/packages/mongo/model-factory');
const SafeJourneySchema = require('../schemas/safe-journey');

module.exports = modelFactory('SafeJourney', { schema: SafeJourneySchema });

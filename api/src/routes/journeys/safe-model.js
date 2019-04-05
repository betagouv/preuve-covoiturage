const modelFactory = require('../../packages/mongo/model-factory');
const SafeJourneySchema = require('../../database/schemas/safe-journey');

module.exports = modelFactory('SafeJourney', { schema: SafeJourneySchema });

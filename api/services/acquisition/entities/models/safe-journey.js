const modelFactory = require('@pdc/shared/providers/mongo/model-factory');
const SafeJourneySchema = require('../schemas/safe-journey');

module.exports = modelFactory('SafeJourney', { schema: SafeJourneySchema });

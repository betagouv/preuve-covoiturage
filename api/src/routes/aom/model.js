const modelFactory = require('../../packages/mongo/model-factory');
const AomSchema = require('../../database/schemas/aom');

module.exports = modelFactory('Aom', { schema: AomSchema });

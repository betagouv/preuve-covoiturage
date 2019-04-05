const mongoose = require('mongoose');
const TokenSchema = require('../../../database/schemas/token');

module.exports = mongoose.model('Token', TokenSchema);

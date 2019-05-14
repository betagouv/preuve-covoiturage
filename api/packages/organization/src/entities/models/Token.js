const mongoose = require('mongoose');
const TokenSchema = require('../schemas/token');

export const Token = mongoose.model('Token', TokenSchema);

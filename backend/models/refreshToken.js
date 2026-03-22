const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const refreshTokenSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tokenHash: { type: String, required: true },
  userAgent: String,
  ip: String,
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
  replacedByTokenHash: String,
  sessionId: { type: String } // Added sessionId
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
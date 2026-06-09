const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  refreshTokenHash: {
    type: String,
    required: true,
  },
  deviceIP: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  revoked: {
    type: Boolean,
    default: false,
  },
});

const Session = mongoose.model("Session", SessionSchema);
module.exports = Session;

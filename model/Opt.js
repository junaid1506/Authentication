const mongoose = require("mongoose");

const optSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    lowercase: true,
    match: /.+\@.+\..+/,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },
  otp: {
    type: String,
    required: [true, "OTP is required"],
  },
  expiresAt: {
    type: Date,
    required: [true, "Expiration time is required"],
  },
});

module.exports = mongoose.model("Opt", optSchema);

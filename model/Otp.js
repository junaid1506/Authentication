const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
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
});

module.exports = mongoose.model("OTP", otpSchema);

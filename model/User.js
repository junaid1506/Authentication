const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      requrequiredire: true,
      minLength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /.+\@.+\..+/,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
      select: false,
    },
    refreshToken: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const userModel = mongoose.model("User", UserSchema);
module.exports = userModel;

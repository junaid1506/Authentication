

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://root:root@cluster0.mmtvrxq.mongodb.net/practice?appName=Cluster0",
    );
    console.log("MongoDB Connected...");
  } catch (err) {
    console.log("Error: ", err.message);
  }
};

module.exports = connectDB;

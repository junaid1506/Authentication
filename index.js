const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const express = require("express");
const dotenv = require("dotenv");
const cookies = require("cookie-parser");
const connectDB = require("./config/db");
const app = express();
dotenv.config();
//APIs
const userRoutes = require("./routes/user.routes");
const todoRoutes = require("./routes/todo.routes");
const authMiddleware = require("./middleware/authMiddleware");

app.use(express.json());
app.use(cookies());

app.use("/api", userRoutes);
app.use("/api", todoRoutes);
connectDB().then(() => {
  app.listen(3000, () => {
    console.log("Server running");
  });
});

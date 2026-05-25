const express = require("express");
const {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo,
} = require("../controller/todo.controller");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/todo", authMiddleware, createTodo);
router.get("/todo", authMiddleware, getTodos);
router.put("/todo/:id", authMiddleware, updateTodo);
router.delete("/todo/:id", authMiddleware, deleteTodo);

module.exports = router;

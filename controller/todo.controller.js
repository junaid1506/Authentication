const Todo = require("../model/Todo");
const mongoose = require("mongoose");

async function createTodo(req, res) {
  try {
    const { title } = req.body;
    const trimmedTitle = title?.trim();

    if (!trimmedTitle) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }
    const { id } = req.user;
    await Todo.create({
      title: trimmedTitle,
      user: id,
    });
    return res.status(201).json({
      success: true,
      message: "Todo create successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
async function getTodos(req, res) {
  try {
    const filter = { user: req.user.id };
    // Search
    if (req.query.search) {
      filter.title = {
        $regex: req.query.search,
        $otpions: "i",
      };
    }
    // Completed

    if (req.query.completed !== undefined) {
      filter.completed = req.query.completed === "true";
    }

    //pagination

    const MAX_LIMIT = 100;
    const DEFAULT_LIMIT = 10;

    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = Math.min(
      Math.max(Number(req.query.limit) || DEFAULT_LIMIT, 1),
      MAX_LIMIT,
    );

    const skip = (page - 1) * limit;

    const [todos, total] = await Promise.all([
      Todo.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Todo.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      todos: todos,
      total: total,
      page: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function updateTodo(req, res) {
  try {
    const { title, completed } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid todo ID",
      });
    }

    if (title === undefined && completed === undefined) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required",
      });
    }

    const updateFields = {};

    if (title !== undefined) {
      const trimmedTitle = title.trim();

      if (!trimmedTitle) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty",
        });
      }

      updateFields.title = trimmedTitle;
    }

    if (completed !== undefined) {
      updateFields.completed = completed;
    }

    const updatedTodo = await Todo.findOneAndUpdate(
      {
        _id: id,
        user: req.user.id,
      },
      updateFields,
      { new: true },
    );

    if (!updatedTodo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    return res.status(200).json({
      success: true,
      todo: updatedTodo,
    });
  } catch (error) {
    console.error("UPDATE TODO ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function deleteTodo(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: "Invalid todo ID",
      });
    }
    const deleteTodo = await Todo.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!deleteTodo) {
      return res.status(400).json({
        success: false,
        message: "Todo not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Todo Delete succcesfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

module.exports = { createTodo, getTodos, updateTodo, deleteTodo };

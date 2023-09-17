import express from "express";
import {
  addTask,
  updateTask,
  getAllTasks,
  deleteTask,
  tasksWithAuthor,
} from "./task.controller.js";
import auth from "../../middleware/auth.js";

const taskRoutes = express.Router();

taskRoutes.post("/addTask", auth, addTask);
taskRoutes.get("/tasks", auth, getAllTasks);
taskRoutes.put("/tasks/:taskId", auth, updateTask);
taskRoutes.delete("/delete/:taskId", auth, deleteTask);
taskRoutes.get("/tasksWithAuthor", auth, tasksWithAuthor);
export default taskRoutes;

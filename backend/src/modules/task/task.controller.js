import { assert } from "console";
import taskModel from "../../db/model/task.model.js";
import jwt from "jsonwebtoken";
import auth from "../../middleware/auth.js";

//! Create a new Task
const addTask = async (req, res) => {
  try {
    let { title, description, status, assignTo, deadline } = req.body;
    console.log(
      `title:${title}, description:${description}, status:${status}, assign to:${assignTo} deadline:${deadline}`
    );
    let { token } = req.cookies;
    let decodedTokenPayload = jwt.verify(token, "SecretKeyCanBeAnything");
    // let newTaskToken = jwt.sign(
    //   { id: decodedTokenPayload.id },
    //   "secretKeyForNewTask"
    //   //{//expiresIn: "5h", // when expired you cannot access /profile}
    // );

    // res.cookie(
    //   "newTaskToken",
    //   newTaskToken //?res.cookie(name, value [, options])
    //   //{ httpOnly: true }
    // );
    let authorId = decodedTokenPayload.id;
    // console.log(authorId);
    let addedTask = await taskModel.create({
      title,
      description,
      status,
      authorId,
      assignTo,
      deadline,
    });

    //new Signature (jwt.sign()) (create a token that holds the task id (most recently added task))

    res
      .status(201)
      .json({ message: "Your task was added successfully", addedTask });
  } catch (error) {
    res.status(400).json({ message: "An Error happened =>", error });
  }
};

//! Update a Task
const updateTask = async (req, res) => {
  try {
    let { taskId } = req.params;
    let { title, description, status, assignTo, deadline } = req.body;
    // //                     ******To Do: Recheck the logic******
    // let { newTaskToken } = req.cookies;
    // let decodedToken = jwt.verify(newTaskToken, "secretKeyForNewTask");
    // let authorId = decodedToken.id;

    let updatedTask = await taskModel.findByIdAndUpdate(taskId, {
      title,
      description,
      status,
      assignTo,
      deadline,
    });
    res
      .status(201)
      .json({ message: "Your task was updated successfully", updatedTask });
  } catch (error) {
    res.status(400).json({ message: "An Error happened =>", error });
  }
};

//! Retrieve all tasks of the current user
const getAllTasks = async (req, res) => {
  let { token } = req.cookies;
  let decodedToken = jwt.verify(token, "SecretKeyCanBeAnything");
  let authorId = decodedToken.id;
  console.log(authorId);
  let allTasks = await taskModel.find({ authorId: authorId });
  console.log(allTasks);
  Array.from(allTasks);
  res.json(allTasks);
};

//! Retrieve all tasks with user data
const tasksWithAuthor = async (req, res) => {
  let data = await taskModel.find().populate("authorId");
  res.json({ message: "All tasks with Author ID field populated", data });
};

//! Delete a task
const deleteTask = async (req, res) => {
  let { taskId } = req.params;
  console.log(taskId);
  let deletedTask = await taskModel.findByIdAndDelete(taskId);
  res.json({ message: "Task was deleted successfully", deletedTask });
};

export { addTask, updateTask, getAllTasks, deleteTask, tasksWithAuthor };

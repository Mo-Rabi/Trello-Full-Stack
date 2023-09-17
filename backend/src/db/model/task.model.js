import { Schema, model, Types } from "mongoose";

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    authorId: {
      type: Types.ObjectId,
      ref: "User",
    },
    assignTo: {
      type: String,
      //ref: "User",
    },
    deadline: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const taskModel = model("Task", taskSchema);

export default taskModel;

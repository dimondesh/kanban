import { Schema, model } from "mongoose";

const cardSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    createdAt: String,
    updatedAt: String,
  },
  { _id: false }
);

const boardSchema = new Schema({
  boardId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  columns: {
    toDo: [cardSchema],
    inProgress: [cardSchema],
    done: [cardSchema],
  },
  createdAt: String,
  updatedAt: String,
});

export const Board = model("Board", boardSchema);

import { Schema, model } from "mongoose";
import { BoardDocument, CardDocument } from "../types";

const cardSchema = new Schema<CardDocument>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { _id: false }
);

const boardSchema = new Schema<BoardDocument>({
  boardId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  columns: {
    toDo: { type: [cardSchema], default: [] },
    inProgress: { type: [cardSchema], default: [] },
    done: { type: [cardSchema], default: [] },
  },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
});

export const Board = model<BoardDocument>("Board", boardSchema);

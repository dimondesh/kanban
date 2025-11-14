import { HydratedDocument } from "mongoose";

export type ColumnKey = "toDo" | "inProgress" | "done";

export interface Card {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  _id: string;
  boardId: string;
  name: string;
  columns: Record<ColumnKey, Card[]>;
  createdAt: string;
  updatedAt: string;
}

export interface CardDocument {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoardDocument {
  boardId: string;
  name: string;
  columns: Record<ColumnKey, CardDocument[]>;
  createdAt: string;
  updatedAt: string;
}
export type BoardDoc = HydratedDocument<BoardDocument>;

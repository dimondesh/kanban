// src/types/board.ts
export type ColumnKey = "toDo" | "inProgress" | "done";

export interface Card {
  id: string; // uuid/nanoid
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  _id: string; // Mongo ObjectId
  boardId: string; // уникальный публичный hash (для URL), например nanoid
  name: string;
  columns: Record<ColumnKey, Card[]>;
  createdAt: string;
  updatedAt: string;
}

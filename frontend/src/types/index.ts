export type ColumnKey = "toDo" | "inProgress" | "done";

export interface Card {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type BoardColumns = Record<ColumnKey, Card[]>;

export interface Board {
  _id: string;
  boardId: string;
  name: string;
  columns: BoardColumns;
  createdAt: string;
  updatedAt: string;
}

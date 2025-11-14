// src/services/board.service.ts
import { Board } from "../models/board.model.js";
import { nanoid } from "nanoid";
import type { ColumnKey } from "../types/index.js";
const now = () => new Date().toISOString();
const columnOrder: ColumnKey[] = ["toDo", "inProgress", "done"];

const httpError = (message: string, statusCode: number) => {
  const error = new Error(message);
  (error as Error & { statusCode?: number }).statusCode = statusCode;
  return error;
};

const getCardId = (card: any) => {
  if (!card) return undefined;
  if (typeof card.id === "string") return card.id;
  if (typeof card.get === "function") {
    const value = card.get("id");
    if (typeof value === "string") return value;
  }
  if (typeof card.toObject === "function") {
    const value = card.toObject().id;
    if (typeof value === "string") return value;
  }
  return undefined;
};

function findCardPosition(board: any, cardId: string) {
  for (const columnKey of columnOrder) {
    // @ts-expect-error - Nested subdocuments are not inferred
    const index = board.columns[columnKey].findIndex((card: any) => {
      const currentId = getCardId(card);
      return currentId === cardId;
    });
    if (index !== -1) {
      return { columnKey, index };
    }
  }
  return null;
}

export async function createBoard(name: string) {
  if (!name?.trim()) throw httpError("Name is required", 400);

  const newBoard = await Board.create({
    boardId: nanoid(8),
    name: name.trim(),
    columns: { toDo: [], inProgress: [], done: [] },
    createdAt: now(),
    updatedAt: now(),
  });

  return newBoard;
}

export async function getBoard(boardId: string) {
  const board = await Board.findOne({ boardId });
  if (!board) throw httpError("Board not found", 404);
  return board;
}

export async function deleteBoard(boardId: string) {
  const res = await Board.findOneAndDelete({ boardId });
  if (!res) throw httpError("Board not found", 404);
}

export async function addCard(
  boardId: string,
  column: ColumnKey,
  title: string,
  description = ""
) {
  const board = await Board.findOne({ boardId });
  if (!board) throw httpError("Board not found", 404);

  const card = {
    id: nanoid(10),
    title: title.trim(),
    description,
    createdAt: now(),
    updatedAt: now(),
  };

  // @ts-expect-error: Mongoose doesn't infer subdocument arrays
  board.columns[column].push(card);
  board.updatedAt = now();
  await board.save();

  return board;
}

export async function moveCard(
  boardId: string,
  cardId: string,
  from: { column: ColumnKey; index: number },
  to: { column: ColumnKey; index: number }
) {
  const board = await Board.findOne({ boardId });
  if (!board) throw httpError("Board not found", 404);

  // @ts-expect-error
  const [card] = board.columns[from.column].splice(from.index, 1);
  if (!card || getCardId(card) !== cardId)
    throw httpError("Card mismatch", 400);

  // @ts-expect-error
  board.columns[to.column].splice(to.index, 0, card);
  board.updatedAt = now();
  await board.save();

  return board;
}

export async function updateCard(
  boardId: string,
  cardId: string,
  payload: { title: string; description?: string }
) {
  const board = await Board.findOne({ boardId });
  if (!board) throw httpError("Board not found", 404);

  if (!payload.title?.trim()) throw httpError("Title is required", 400);

  const position = findCardPosition(board, cardId);
  if (!position) throw httpError("Card not found", 404);

  // @ts-expect-error - Nested subdocuments are not inferred
  const card = board.columns[position.columnKey][position.index];
  card.title = payload.title.trim();
  if (typeof payload.description === "string") {
    card.description = payload.description;
  }
  card.updatedAt = now();

  board.updatedAt = now();
  await board.save();
  return board;
}

export async function deleteCard(boardId: string, cardId: string) {
  const board = await Board.findOne({ boardId });
  if (!board) throw httpError("Board not found", 404);

  const position = findCardPosition(board, cardId);
  if (!position) throw httpError("Card not found", 404);

  // @ts-expect-error - Nested subdocuments are not inferred
  board.columns[position.columnKey].splice(position.index, 1);
  board.updatedAt = now();
  await board.save();

  return board;
}

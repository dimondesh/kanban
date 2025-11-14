import { Board } from "../models/board.model";
import { nanoid } from "nanoid";
import type { BoardDoc, CardDocument, ColumnKey } from "../types/index";
const now = () => new Date().toISOString();
const columnOrder: ColumnKey[] = ["toDo", "inProgress", "done"];
const TITLE_MAX_LENGTH = 64;
const DESCRIPTION_MAX_LENGTH = 128;

const httpError = (message: string, statusCode: number) => {
  const error = new Error(message);
  (error as Error & { statusCode?: number }).statusCode = statusCode;
  return error;
};

const isColumnKey = (value: unknown): value is ColumnKey =>
  typeof value === "string" && columnOrder.includes(value as ColumnKey);

const getCardId = (card: unknown) => {
  if (typeof card !== "object" || card === null) return undefined;

  if ("id" in card) {
    const value = (card as { id?: unknown }).id;
    if (typeof value === "string") return value;
  }

  if ("get" in card && typeof (card as { get?: unknown }).get === "function") {
    const value = (card as { get: (path: string) => unknown }).get("id");
    if (typeof value === "string") return value;
  }

  if (
    "toObject" in card &&
    typeof (card as { toObject?: unknown }).toObject === "function"
  ) {
    const value = (card as { toObject: () => { id?: unknown } }).toObject().id;
    if (typeof value === "string") return value;
  }

  return undefined;
};

function findCardPosition(board: BoardDoc, cardId: string) {
  for (const columnKey of columnOrder) {
    const column = board.columns[columnKey] ?? [];
    const index = column.findIndex((card) => getCardId(card) === cardId);
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

export async function updateBoardName(boardId: string, name: string) {
  if (!name?.trim()) throw httpError("Name is required", 400);

  const board = await Board.findOneAndUpdate(
    { boardId },
    { name: name.trim(), updatedAt: now() },
    { new: true }
  );

  if (!board) throw httpError("Board not found", 404);
  return board;
}

export async function deleteBoard(boardId: string) {
  const res = await Board.findOneAndDelete({ boardId });
  return !!res;
}

export async function addCard(
  boardId: string,
  column: ColumnKey,
  title: string,
  description = ""
) {
  const board = await Board.findOne({ boardId });
  if (!board) throw httpError("Board not found", 404);

  if (!isColumnKey(column)) throw httpError("Invalid column", 400);

  if (typeof title !== "string") {
    throw httpError("Title is required", 400);
  }

  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    throw httpError("Title is required", 400);
  }
  if (trimmedTitle.length > TITLE_MAX_LENGTH) {
    throw httpError(
      `Title must be at most ${TITLE_MAX_LENGTH} characters`,
      400
    );
  }

  const targetColumn = board.columns[column];
  if (!Array.isArray(targetColumn)) {
    throw httpError("Invalid column", 400);
  }

  const safeDescription = typeof description === "string" ? description : "";
  if (safeDescription.length > DESCRIPTION_MAX_LENGTH) {
    throw httpError(
      `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters`,
      400
    );
  }

  const card: CardDocument = {
    id: nanoid(10),
    title: trimmedTitle,
    description: safeDescription,
    createdAt: now(),
    updatedAt: now(),
  };

  targetColumn.push(card);
  board.updatedAt = now();
  await board.save();

  return board;
}

type MoveLocation = { column: ColumnKey; index: number };

export async function moveCard(
  boardId: string,
  cardId: string,
  from: MoveLocation | undefined,
  to: MoveLocation | undefined
) {
  const board = await Board.findOne({ boardId });
  if (!board) throw httpError("Board not found", 404);

  if (typeof cardId !== "string" || !cardId.trim()) {
    throw httpError("Card ID is required", 400);
  }
  const normalizedCardId = cardId.trim();

  const fromColumnKey = from?.column;
  const toColumnKey = to?.column;

  if (!isColumnKey(fromColumnKey)) {
    throw httpError("Invalid source column", 400);
  }
  if (!isColumnKey(toColumnKey)) {
    throw httpError("Invalid destination column", 400);
  }

  const sourceColumn = board.columns[fromColumnKey];
  const destinationColumn = board.columns[toColumnKey];

  const fromIndex = from?.index;
  if (
    typeof fromIndex !== "number" ||
    !Number.isInteger(fromIndex) ||
    fromIndex < 0 ||
    fromIndex >= sourceColumn.length
  ) {
    throw httpError("Source index is out of bounds", 400);
  }

  const toIndex = to?.index;
  if (
    typeof toIndex !== "number" ||
    !Number.isInteger(toIndex) ||
    toIndex < 0 ||
    toIndex > destinationColumn.length
  ) {
    throw httpError("Destination index is out of bounds", 400);
  }

  const card = sourceColumn[fromIndex];
  if (!card) throw httpError("Card not found", 404);
  if (getCardId(card) !== normalizedCardId)
    throw httpError("Card mismatch", 400);

  sourceColumn.splice(fromIndex, 1);
  destinationColumn.splice(toIndex, 0, card);
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

  if (typeof payload.title !== "string") {
    throw httpError("Title is required", 400);
  }

  const trimmedTitle = payload.title.trim();
  if (!trimmedTitle) throw httpError("Title is required", 400);
  if (trimmedTitle.length > TITLE_MAX_LENGTH) {
    throw httpError(
      `Title must be at most ${TITLE_MAX_LENGTH} characters`,
      400
    );
  }

  const position = findCardPosition(board, cardId);
  if (!position) throw httpError("Card not found", 404);

  const column = board.columns[position.columnKey];
  const card = column[position.index];
  card.title = trimmedTitle;
  if (typeof payload.description === "string") {
    if (payload.description.length > DESCRIPTION_MAX_LENGTH) {
      throw httpError(
        `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters`,
        400
      );
    }
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

  board.columns[position.columnKey].splice(position.index, 1);
  board.updatedAt = now();
  await board.save();

  return board;
}

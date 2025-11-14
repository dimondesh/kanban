import type { Request, Response } from "express";
import type { ColumnKey } from "../types/index.js";
import {
  createBoard as createBoardService,
  getBoard as getBoardService,
  deleteBoard as deleteBoardService,
  addCard as addCardService,
  moveCard as moveCardService,
  updateCard as updateCardService,
  deleteCard as deleteCardService,
} from "../services/board.service.js";

type KnownError = Error & { statusCode?: number };

function sendError(res: Response, err: unknown, fallback: string) {
  const typed = err as KnownError;
  const statusCode = typed?.statusCode ?? 500;
  const message =
    typed?.message && typeof typed.message === "string"
      ? typed.message
      : fallback;

  if (statusCode >= 500) {
    console.error(fallback, err);
  }

  res.status(statusCode).json({ message });
}

export const createBoard = async (req: Request, res: Response) => {
  try {
    const board = await createBoardService(req.body?.name);
    res.status(201).json(board);
  } catch (err) {
    sendError(res, err, "Failed to create board");
  }
};

export const getBoard = async (req: Request, res: Response) => {
  try {
    const board = await getBoardService(req.params.boardId);
    res.json(board);
  } catch (err) {
    sendError(res, err, "Failed to fetch board");
  }
};

export const deleteBoard = async (req: Request, res: Response) => {
  try {
    await deleteBoardService(req.params.boardId);
    res.status(204).end();
  } catch (err) {
    sendError(res, err, "Failed to delete board");
  }
};

export const addCard = async (req: Request, res: Response) => {
  try {
    const board = await addCardService(
      req.params.boardId,
      req.body.column as ColumnKey,
      req.body.title,
      req.body.description ?? ""
    );
    res.status(201).json(board);
  } catch (err) {
    sendError(res, err, "Failed to add card");
  }
};

export const moveCard = async (req: Request, res: Response) => {
  try {
    const board = await moveCardService(
      req.params.boardId,
      req.params.cardId,
      req.body.from,
      req.body.to
    );
    res.json(board);
  } catch (err) {
    sendError(res, err, "Failed to move card");
  }
};

export const updateCard = async (req: Request, res: Response) => {
  try {
    const board = await updateCardService(
      req.params.boardId,
      req.params.cardId,
      {
        title: req.body.title,
        description: req.body.description,
      }
    );
    res.json(board);
  } catch (err) {
    sendError(res, err, "Failed to update card");
  }
};

export const deleteCard = async (req: Request, res: Response) => {
  try {
    const board = await deleteCardService(
      req.params.boardId,
      req.params.cardId
    );
    res.json(board);
  } catch (err) {
    sendError(res, err, "Failed to delete card");
  }
};

import { Router } from "express";
import {
  createBoard,
  getBoard,
  updateBoard,
  deleteBoard,
  addCard,
  moveCard,
  updateCard,
  deleteCard,
} from "../controllers/board.controller";

const router = Router();

router.post("/", createBoard);
router.get("/:boardId", getBoard);
router.patch("/:boardId", updateBoard);
router.delete("/:boardId", deleteBoard);
router.post("/:boardId/cards", addCard);
router.patch("/:boardId/cards/:cardId", updateCard);
router.delete("/:boardId/cards/:cardId", deleteCard);
router.patch("/:boardId/cards/:cardId/move", moveCard);

export default router;

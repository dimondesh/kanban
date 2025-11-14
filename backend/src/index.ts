import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import boardRoutes from "./routes/board.routes.js";
import { updateCard, deleteCard } from "./controllers/board.controller.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/boards", boardRoutes);
app.patch("/api/boards/:boardId/cards/:cardId", updateCard);
app.delete("/api/boards/:boardId/cards/:cardId", deleteCard);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/kanban";

connectDB(MONGO_URI).then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
});

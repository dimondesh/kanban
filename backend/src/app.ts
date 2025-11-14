// src/app.ts
import express from "express";
import cors from "cors";
import boardRoutes from "./routes/board.routes";
import { notFound, errorHandler } from "./middlewares/error";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/boards", boardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

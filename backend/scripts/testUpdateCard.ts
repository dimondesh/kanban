import dotenv from "dotenv";
import { connectDB } from "../src/config/db.js";
import { updateCard } from "../src/services/board.service.js";

dotenv.config({ path: "../.env" });

async function main() {
  const boardId = process.argv[2];
  const cardId = process.argv[3];
  if (!boardId || !cardId) {
    throw new Error("Usage: ts-node scripts/testUpdateCard.ts <boardId> <cardId>");
  }

  const mongoUri =
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/kanban";

  await connectDB(mongoUri);
  const board = await updateCard(boardId, cardId, {
    title: "script-test",
    description: "script updated description",
  });
  console.log(
    board.columns,
    board.columns.toDo.find((card) => card.id === cardId)
  );
}

main()
  .then(() => {
    console.log("Done");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

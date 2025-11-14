import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddBoardModal } from "../../components/AddBoardModal";
import { useAppDispatch } from "../../redux/hooks";
import { createBoard } from "../../redux/boards/boardsSlice";

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [isBoardModalOpen, setBoardModalOpen] = useState(false);
  const [boardIdInput, setBoardIdInput] = useState("");
  const [lastCreatedBoardId, setLastCreatedBoardId] = useState<string | null>(
    null
  );

  const handleLoadBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardIdInput.trim()) return;
    navigate(`/boards/${boardIdInput.trim()}`);
  };

  const handleCreateBoard = async (name: string) => {
    const board = await dispatch(createBoard({ name })).unwrap();
    setLastCreatedBoardId(board.boardId);
    navigate(`/boards/${board.boardId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full  text-white p-6 gap-6">
      <div className="text-center space-y-4 hide">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-400">
          Task Management
        </p>
        <h1 className="text-4xl font-bold">Kanban Boards</h1>
        <p className="text-zinc-400 max-w-md">
          Create anonymous boards, load them by ID, and collaborate in real-time
          without authentication.
        </p>
      </div>

      <form
        onSubmit={handleLoadBoard}
        className="flex flex-col sm:flex-row gap-3 w-full max-w-xl"
      >
        <input
          placeholder="Enter board ID"
          value={boardIdInput}
          onChange={(e) => setBoardIdInput(e.target.value)}
          className="flex-1 px-4 py-2 rounded bg-zinc-900 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium disabled:opacity-50"
          disabled={!boardIdInput.trim()}
        >
          Load Board
        </button>
      </form>

      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => setBoardModalOpen(true)}
          className="text-blue-400 font-medium hover:text-blue-500"
        >
          + Create new board
        </button>
        {lastCreatedBoardId && (
          <p className="text-sm text-zinc-400">
            Last created board ID:{" "}
            <button
              type="button"
              className="font-mono text-blue-300 underline decoration-dotted"
              onClick={() => navigate(`/boards/${lastCreatedBoardId}`)}
            >
              {lastCreatedBoardId}
            </button>
          </p>
        )}
      </div>

      <AddBoardModal
        isOpen={isBoardModalOpen}
        onClose={() => setBoardModalOpen(false)}
        onCreate={handleCreateBoard}
      />
    </div>
  );
};

export default HomePage;

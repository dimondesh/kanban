import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AddTaskModal } from "../../components/AddTaskModal";
import { EditCardModal } from "../../components/EditCardModal";
import { ConfirmDeleteModal } from "../../components/ConfirmDeleteModal";
import { EditBoardModal } from "../../components/EditBoardModal";
import { Column } from "../../components/Column";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  addCard,
  fetchBoard,
  localMoveCard,
  moveCard,
  updateCard,
  deleteCard,
  updateBoard,
  deleteBoard,
} from "../../redux/boards/boardsSlice";
import { CardPreview } from "../../components/Card";
import type { Card as CardType, ColumnKey } from "../../types";

const columnMeta: Array<{ key: ColumnKey; title: string }> = [
  { key: "toDo", title: "To Do" },
  { key: "inProgress", title: "In Progress" },
  { key: "done", title: "Done" },
];

type DragData =
  | {
      type: "card";
      columnKey: ColumnKey;
      index: number;
    }
  | {
      type: "column";
      columnKey: ColumnKey;
      index: number;
    };

const BoardsPage = () => {
  const { boardId } = useParams<{ boardId?: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    current: board,
    status,
    error,
  } = useAppSelector((state) => state.boards);

  const columnLabels = useMemo(
    () =>
      columnMeta.reduce(
        (acc, column) => {
          acc[column.key] = column.title;
          return acc;
        },
        {} as Record<ColumnKey, string>
      ),
    []
  );

  const [boardIdInput, setBoardIdInput] = useState(boardId ?? "");
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<ColumnKey | null>(null);
  const [activeCard, setActiveCard] = useState<{
    card: CardType;
    columnKey: ColumnKey;
    index: number;
  } | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<{
    card: CardType;
    columnKey: ColumnKey;
  } | null>(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteContext, setDeleteContext] = useState<{
    card: CardType;
    columnKey: ColumnKey;
  } | null>(null);
  const [isDeletingCard, setDeletingCard] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isRenameModalOpen, setRenameModalOpen] = useState(false);
  const [isDeleteBoardModalOpen, setDeleteBoardModalOpen] = useState(false);
  const [isDeletingBoard, setDeletingBoardState] = useState(false);
  const [deleteBoardError, setDeleteBoardError] = useState<string | null>(null);

  useEffect(() => {
    if (boardId) {
      dispatch(fetchBoard(boardId));
    }
  }, [boardId, dispatch]);

  useEffect(() => {
    if (boardId) {
      setBoardIdInput(boardId);
    }
  }, [boardId]);

  useEffect(() => {
    if (!board || !editingCard) return;
    const latestCard = board.columns[editingCard.columnKey].find(
      (item) => item.id === editingCard.card.id
    );
    if (latestCard && latestCard !== editingCard.card) {
      setEditingCard({ card: latestCard, columnKey: editingCard.columnKey });
    }
  }, [board, editingCard]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const openAddTaskModal = (column: ColumnKey) => {
    setSelectedColumn(column);
    setTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setTaskModalOpen(false);
    setSelectedColumn(null);
  };

  const openEditCardModal = (card: CardType, columnKey: ColumnKey) => {
    setEditingCard({ card, columnKey });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingCard(null);
  };

  const openDeleteModal = (card: CardType, columnKey: ColumnKey) => {
    setDeleteContext({ card, columnKey });
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeletingCard(false);
    setDeleteContext(null);
    setDeleteError(null);
  };

  const openRenameBoardModal = () => {
    setRenameModalOpen(true);
  };

  const closeRenameBoardModal = () => {
    setRenameModalOpen(false);
  };

  const openDeleteBoardModal = () => {
    setDeleteBoardError(null);
    setDeleteBoardModalOpen(true);
  };

  const closeDeleteBoardModal = () => {
    setDeleteBoardModalOpen(false);
    setDeletingBoardState(false);
    setDeleteBoardError(null);
  };

  const handleAddTask = async (title: string, description: string) => {
    if (!board || !selectedColumn) {
      throw new Error("Board is not loaded yet");
    }

    await dispatch(
      addCard({
        boardId: board.boardId,
        column: selectedColumn,
        title,
        description,
      })
    ).unwrap();
    closeTaskModal();
  };

  const handleUpdateCard = async (title: string, description: string) => {
    if (!board || !editingCard) {
      throw new Error("Board is not loaded yet");
    }

    await dispatch(
      updateCard({
        boardId: board.boardId,
        cardId: editingCard.card.id,
        title,
        description,
      })
    ).unwrap();
  };

  const handleDeleteRequest = (card: CardType, columnKey: ColumnKey) => {
    if (!board) return;
    openDeleteModal(card, columnKey);
  };

  const handleRenameBoard = async (name: string) => {
    if (!board) {
      throw new Error("Board is not loaded yet");
    }

    await dispatch(
      updateBoard({
        boardId: board.boardId,
        name,
      })
    ).unwrap();
  };

  const confirmDeleteBoard = async () => {
    if (!board) return;

    setDeletingBoardState(true);
    setDeleteBoardError(null);

    try {
      await dispatch(deleteBoard({ boardId: board.boardId })).unwrap();
      closeDeleteBoardModal();
      navigate("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete the board";
      setDeleteBoardError(message);
    } finally {
      setDeletingBoardState(false);
    }
  };

  const confirmDeleteCard = async () => {
    if (!board || !deleteContext) return;

    setDeletingCard(true);
    setDeleteError(null);

    try {
      await dispatch(
        deleteCard({
          boardId: board.boardId,
          cardId: deleteContext.card.id,
        })
      ).unwrap();

      if (editingCard?.card.id === deleteContext.card.id) {
        closeEditModal();
      }

      closeDeleteModal();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete the task";
      setDeleteError(message);
    } finally {
      setDeletingCard(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (!board) return;
    const data = event.active.data.current as DragData | undefined;
    if (!data || data.type !== "card") return;

    const card = board.columns[data.columnKey][data.index];
    if (!card) return;

    setActiveCard({
      card,
      columnKey: data.columnKey,
      index: data.index,
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveCard(null);
    if (!board) return;

    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current as DragData | undefined;
    const overData = over.data.current as DragData | undefined;
    if (!activeData || activeData.type !== "card" || !overData) return;

    const fromColumn = activeData.columnKey;
    const fromIndex = activeData.index;
    const toColumn = overData.columnKey;
    const toIndex =
      overData.type === "card"
        ? overData.index
        : board.columns[toColumn].length;

    if (fromColumn === toColumn && fromIndex === toIndex) {
      return;
    }

    const movePayload = {
      cardId: active.id as string,
      from: { column: fromColumn, index: fromIndex },
      to: { column: toColumn, index: toIndex },
    };

    const currentBoardId = board.boardId;
    dispatch(localMoveCard(movePayload));
    try {
      await dispatch(
        moveCard({
          boardId: currentBoardId,
          ...movePayload,
        })
      ).unwrap();
    } catch (err) {
      console.error("Failed to move card on server", err);
      dispatch(fetchBoard(currentBoardId));
    }
  };

  const handleDragCancel = () => {
    setActiveCard(null);
  };

  const handleBoardSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardIdInput.trim()) return;
    navigate(`/boards/${boardIdInput.trim()}`);
  };

  const handleRefresh = () => {
    if (boardId) {
      dispatch(fetchBoard(boardId));
    }
  };

  const showBoardFallback = Boolean(boardId) && status === "error" && !board;
  const normalizedError = error?.toLowerCase() ?? "";
  const isNotFoundError =
    normalizedError.includes("404") || normalizedError.includes("not found");
  const fallbackTitle = isNotFoundError
    ? "Board not found"
    : "Unable to load board";
  const fallbackDescription = isNotFoundError
    ? "The requested board ID does not exist. Double-check the ID or create a new board."
    : "We couldn't load this board right now. Please try again.";

  const isLoading = status === "loading";
  const showInitialLoader = isLoading && !board;

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleBoardSearch}
        className="flex flex-col sm:flex-row gap-3"
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
          Load board
        </button>
      </form>

      {!boardId && (
        <p className="text-zinc-400">
          Enter a board ID above to view its tasks or create a new board on the
          home page.
        </p>
      )}

      {boardId && !showBoardFallback && (
        <div className="bg-zinc-900 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-sm uppercase text-zinc-400">Board</p>
            <h2 className="text-2xl font-semibold sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl truncate">
              {board?.name ?? "Loading..."}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              ID: <span className="font-mono text-blue-300">{boardId}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            {isLoading && board && (
              <span className="text-xs text-zinc-400 self-center">
                Syncing...
              </span>
            )}
            <button
              type="button"
              onClick={handleRefresh}
              className="border border-zinc-600 px-3 py-1 rounded hover:border-blue-500 disabled:opacity-50"
              disabled={!boardId || isLoading}
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => openAddTaskModal("toDo")}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
              disabled={!board}
            >
              + Quick task
            </button>
            <button
              type="button"
              onClick={openRenameBoardModal}
              className="border border-zinc-600 px-3 py-1 rounded hover:border-blue-500 disabled:opacity-50"
              disabled={!board}
            >
              Rename
            </button>
            <button
              type="button"
              onClick={openDeleteBoardModal}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded disabled:opacity-50"
              disabled={!board}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {showInitialLoader && (
        <p className="text-zinc-400" aria-live="polite">
          Loading board data...
        </p>
      )}

      {error && (
        <p className="text-red-400" role="alert">
          {error}
        </p>
      )}

      {board ? (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          collisionDetection={closestCorners}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {columnMeta.map((column) => (
              <Column
                key={column.key}
                columnKey={column.key}
                title={column.title}
                cards={board.columns[column.key]}
                onAddCard={openAddTaskModal}
                onEditCard={openEditCardModal}
                onDeleteCard={handleDeleteRequest}
              />
            ))}
          </div>
          <DragOverlay adjustScale={false}>
            {activeCard ? <CardPreview card={activeCard.card} /> : null}
          </DragOverlay>
        </DndContext>
      ) : showBoardFallback ? (
        <div className="bg-zinc-900 rounded-xl border border-red-900 p-6 text-center space-y-4">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-red-400">
              {fallbackTitle}
            </p>
            <p className="text-lg text-zinc-200">{fallbackDescription}</p>
            <p className="text-sm text-zinc-500">
              Board ID:{" "}
              <span className="font-mono text-zinc-100">{boardId}</span>
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              className="border border-zinc-600 px-3 py-1 rounded hover:border-blue-500 disabled:opacity-50"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
            >
              Go to home
            </button>
          </div>
        </div>
      ) : null}

      <AddTaskModal
        isOpen={isTaskModalOpen}
        onClose={closeTaskModal}
        columnLabel={selectedColumn ? columnLabels[selectedColumn] : undefined}
        onAdd={handleAddTask}
      />
      <EditCardModal
        isOpen={isEditModalOpen}
        card={editingCard?.card}
        columnLabel={
          editingCard ? columnLabels[editingCard.columnKey] : undefined
        }
        onClose={closeEditModal}
        onSave={handleUpdateCard}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        title="Delete task"
        message={
          deleteContext
            ? `Are you sure you want to delete "${deleteContext.card.title}"${
                columnLabels[deleteContext.columnKey]
                  ? ` from "${columnLabels[deleteContext.columnKey]}"?`
                  : "?"
              }\nThis action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        isDeleting={isDeletingCard}
        error={deleteError}
        onConfirm={confirmDeleteCard}
        onCancel={closeDeleteModal}
      />
      <EditBoardModal
        isOpen={isRenameModalOpen}
        initialName={board?.name}
        onClose={closeRenameBoardModal}
        onSave={handleRenameBoard}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteBoardModalOpen}
        title="Delete board"
        message={
          board
            ? `Are you sure you want to delete "${board.name}"?\nThis will permanently remove all of its tasks.`
            : ""
        }
        confirmLabel="Delete board"
        isDeleting={isDeletingBoard}
        error={deleteBoardError}
        onConfirm={confirmDeleteBoard}
        onCancel={closeDeleteBoardModal}
      />
    </div>
  );
};

export default BoardsPage;

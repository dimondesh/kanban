import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { Board, ColumnKey } from "../../types";

const API = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

export const fetchBoard = createAsyncThunk<Board, string>(
  "boards/fetchBoard",
  async (boardId) => {
    const { data } = await axios.get(`${API}/boards/${boardId}`);
    return data;
  }
);

export const createBoard = createAsyncThunk<Board, { name: string }>(
  "boards/createBoard",
  async ({ name }) => {
    const { data } = await axios.post(`${API}/boards`, { name });
    return data;
  }
);

export const updateBoard = createAsyncThunk<
  Board,
  { boardId: string; name: string }
>("boards/updateBoard", async ({ boardId, name }) => {
  const { data } = await axios.patch(`${API}/boards/${boardId}`, { name });
  return data;
});

export const deleteBoard = createAsyncThunk<
  { boardId: string },
  { boardId: string }
>("boards/deleteBoard", async ({ boardId }) => {
  await axios.delete(`${API}/boards/${boardId}`);
  return { boardId };
});

export const addCard = createAsyncThunk<
  Board,
  { boardId: string; column: ColumnKey; title: string; description?: string }
>("boards/addCard", async (payload) => {
  const { boardId, column, title, description = "" } = payload;
  const { data } = await axios.post(`${API}/boards/${boardId}/cards`, {
    column,
    title,
    description,
  });
  return data;
});

export const moveCard = createAsyncThunk<
  Board,
  {
    boardId: string;
    cardId: string;
    from: { column: ColumnKey; index: number };
    to: { column: ColumnKey; index: number };
  }
>("boards/moveCard", async (payload) => {
  const { boardId, cardId, from, to } = payload;

  const { data } = await axios.patch(
    `${API}/boards/${boardId}/cards/${cardId}/move`,
    { from, to }
  );

  return data;
});

export const updateCard = createAsyncThunk<
  Board,
  {
    boardId: string;
    cardId: string;
    title: string;
    description?: string;
  }
>("boards/updateCard", async ({ boardId, cardId, title, description = "" }) => {
  const { data } = await axios.patch(
    `${API}/boards/${boardId}/cards/${cardId}`,
    { title, description }
  );
  return data;
});

export const deleteCard = createAsyncThunk<
  Board,
  {
    boardId: string;
    cardId: string;
  }
>("boards/deleteCard", async ({ boardId, cardId }) => {
  const { data } = await axios.delete(
    `${API}/boards/${boardId}/cards/${cardId}`
  );
  return data;
});

interface BoardsState {
  current?: Board;
  currentBoardId?: string;
  status: "idle" | "loading" | "success" | "error";
  error?: string;
}

const initialState: BoardsState = {
  status: "idle",
};

const boardsSlice = createSlice({
  name: "boards",
  initialState,
  reducers: {
    localMoveCard(
      state,
      action: PayloadAction<{
        cardId: string;
        from: { column: ColumnKey; index: number };
        to: { column: ColumnKey; index: number };
      }>
    ) {
      if (!state.current) return;

      const { cardId, from, to } = action.payload;
      const sourceArr = state.current.columns[from.column];
      const destArr = state.current.columns[to.column];

      if (!sourceArr || !destArr) return;

      const [card] = sourceArr.splice(from.index, 1);
      if (!card || card.id !== cardId) return;

      destArr.splice(to.index, 0, card);
    },
    resetBoard(state) {
      state.current = undefined;
      state.currentBoardId = undefined;
      state.status = "idle";
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoard.pending, (state, action) => {
        state.status = "loading";
        state.error = undefined;
        state.current = undefined;
        state.currentBoardId = action.meta.arg;
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message;
      })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.status = "success";
        state.current = action.payload;
        state.currentBoardId = action.payload.boardId;
      });

    const restThunks = [
      createBoard,
      updateBoard,
      addCard,
      moveCard,
      updateCard,
      deleteCard,
    ] as const;

    for (const thunk of restThunks) {
      builder
        .addCase(thunk.pending, (state) => {
          state.status = "loading";
          state.error = undefined;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.status = "error";
          state.error = action.error.message;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.status = "success";
          state.current = action.payload;
          state.currentBoardId = action.payload.boardId;
        });
    }
    builder
      .addCase(deleteBoard.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(deleteBoard.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error.message;
      })
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.status = "success";
        if (state.current?.boardId === action.payload.boardId) {
          state.current = undefined;
          state.currentBoardId = undefined;
        }
      });
  },
});

export const { localMoveCard, resetBoard } = boardsSlice.actions;
export default boardsSlice.reducer;

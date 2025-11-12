import { createSlice } from "@reduxjs/toolkit";

const initialState = {};
const slice = createSlice({
  name: "boards",
  initialState,
  reducers: {},
});

export const boardsReducer = slice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import exampleService from "./exampleService";
import { getErrorMessage } from "../../utils/getErrorMessage";

const initialState = {
  isLoading: false,
  users: [],
};

export const getUsers = createAsyncThunk(
  "example/getUsers",
  async (_, thunkAPI) => {
    try {
      return await exampleService.getUsers();
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const exampleSlice = createSlice({
  name: "example",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(getUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(getUsers.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default exampleSlice.reducer;

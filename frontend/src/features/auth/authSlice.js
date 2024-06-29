import { createSlice, createAsyncThunk, createAction } from "@reduxjs/toolkit";
import { getErrorMessage } from "../../utils/getErrorMessage";
import authService from "./authService";

const initialState = {
  username: localStorage.getItem("username") || "",
  isLoading: false,
  accessToken: localStorage.getItem("accessToken") || "",
  refreshToken: localStorage.getItem("refreshToken") || "",
  division: localStorage.getItem("division") || "",
  isAdmin: localStorage.getItem("super_user") || "",
};

export const login = createAsyncThunk("auth/login", async (user, thunkAPI) => {
  try {
    return await authService.login(user);
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const resetPassword = createAsyncThunk(
  "auth/reset-password",
  async (user, thunkAPI) => {
    try {
      return await authService.resetPassword(user);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    return await authService.logout();
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (userData, thunkAPI) => {
    try {
      return await authService.forgotPassword(userData);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const confirmForgotPassword = createAsyncThunk(
  "auth/confirmPassowrd",
  async (reqData, thunkAPI) => {
    try {
      return await authService.confirmPassword(reqData);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const verifyDivision = createAsyncThunk(
  "auth/verifyDivision",
  async (reqData, thunkAPI) => {
    try {
      return await authService.verifyDivision(reqData);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    addDivision: (state, action) => {
      state.division = action.payload;
      localStorage.setItem("division", action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      const { username, access_token, refresh_token, super_user } =
        action.payload;

      state.username = username;
      state.accessToken = access_token;
      state.refreshToken = refresh_token;
      state.isLoading = false;
      state.isAdmin = super_user;
    });
    builder.addCase(login.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(resetPassword.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(resetPassword.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(resetPassword.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(logout.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(logout.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(forgotPassword.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(forgotPassword.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(forgotPassword.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(confirmForgotPassword.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(confirmForgotPassword.fulfilled, (state, action) => {
      const { username, access_token, refresh_token } = action.payload;

      state.username = username;
      state.accessToken = access_token;
      state.refreshToken = refresh_token;
      state.isLoading = false;
    });
    builder.addCase(confirmForgotPassword.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(verifyDivision.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(verifyDivision.fulfilled, (state, action) => {
      const { division } = action.payload;

      state.isLoading = false;
      state.division = division;
    });
    builder.addCase(verifyDivision.rejected, (state) => {
      state.isLoading = false;
    });
  },
});

const { actions } = authSlice;

export const { addDivision } = actions;

export default authSlice.reducer;

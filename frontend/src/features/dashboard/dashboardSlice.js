import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getErrorMessage } from "../../utils/getErrorMessage";
import dashboardService from "./dashboardService";

const initialState = {
  uploadedTenders: 0,
  processedPages: 0,
  isLoading: false,
  tenderFiles: [],
};

export const getTenderFiles = createAsyncThunk(
  "dashboard/getTenderFiles",
  async (division, thunkAPI) => {
    try {
      return await dashboardService.getTenderFiles(division);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchRecentTenderFiles = createAsyncThunk(
  "dashboard/fetchRecentTenderFiles",
  async (division, thunkAPI) => {
    try {
      return await dashboardService.fetchRecentTenderFiles(division);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const filterTenders = createAsyncThunk(
  "dashboard/filterTenders",
  async (data, thunkAPI) => {
    try {
      return await dashboardService.filterTenders(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchProcessedPagesData = createAsyncThunk(
  "dashboard/fetchProcessedPagesData",
  async (data, thunkAPI) => {
    try {
      return await dashboardService.fetchProcessedPagesData(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const markTenderFailed = createAsyncThunk("dashboard/markTenderFailed", async (data, thunkAPI) => {
  try {
    return await dashboardService.markTenderFailed(data);
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
})

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    appendTender: (state, action) => {
      const tender = action.payload;

      const existingTenderFile = state.tenderFiles.find(
        (tenderFile) => tenderFile._id === tender._id
      );

      if (!existingTenderFile) {
        state.tenderFiles.push(action.payload);
      }
    },

    updateTender: (state, action) => {
      const tenderFile = action.payload;

      for (let i = 0; i < state.tenderFiles.length; i++) {
        if (state.tenderFiles[i]._id === tenderFile._id) {
          state.tenderFiles[i] = {
            ...tenderFile,
          };
          break;
        }
      }
    },

    succeedTender: (state, action) => {
      const tenderFile = action.payload;
      for (let i = 0; i < state.tenderFiles.length; i++) {
        if (
          state.tenderFiles[i].tender_name === tenderFile.tender_name &&
          state.tenderFiles[i].tender_number === tenderFile.tender_number
        ) {
          state.tenderFiles[i] = {
            ...tenderFile,
            tender_status: "Succeeded",
          };
          break;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getTenderFiles.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getTenderFiles.fulfilled, (state, action) => {
      const data = action.payload;

      state.isLoading = false;
      state.tenderFiles = data;
      state.uploadedTenders = data.length;
    });
    builder.addCase(getTenderFiles.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(fetchRecentTenderFiles.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchRecentTenderFiles.fulfilled, (state, action) => {
      const result = action.payload;

      state.isLoading = false;
      state.tenderFiles = result.data;
      state.uploadedTenders = result.length;
    });
    builder.addCase(fetchRecentTenderFiles.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(filterTenders.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(filterTenders.fulfilled, (state, action) => {
      state.isLoading = false;
      state.tenderFiles = action.payload;
    });
    builder.addCase(filterTenders.rejected, (state) => {
      state.isLoading = false;
    });


    builder.addCase(markTenderFailed.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(markTenderFailed.fulfilled, (state, action) => {
      state.isLoading = false;
    });
    builder.addCase(markTenderFailed.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(fetchProcessedPagesData.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchProcessedPagesData.fulfilled, (state, action) => {
      const { message } = action.payload;

      state.isLoading = false;
      state.processedPages = message.length > 0 ? message[0].total_count : 0;
    });
    builder.addCase(fetchProcessedPagesData.rejected, (state) => {
      state.isLoading = false;
    });
  },
});

const { actions } = dashboardSlice;

export const { appendTender, updateTender, succeedTender } = actions;

export default dashboardSlice.reducer;

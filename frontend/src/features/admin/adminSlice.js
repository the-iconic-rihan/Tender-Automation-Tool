import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getErrorMessage } from "../../utils/getErrorMessage";
import adminService from "./adminService";
import { getISTDate } from "../../utils/dateFormats";

const initialState = {
  totalUsers: 0,
  totalTendors: 0,
  totalPages: 0,
  isLoading: false,
  fromDate: getISTDate(),
  toDate: getISTDate(),
  tenders: {
    WWS_SPG: {
      pages: 0,
      tenders: 0,
    },
    WWS_IPG: {
      pages: 0,
      tenders: 0,
    },
    WWS_Services: {
      pages: 0,
      tenders: 0,
    },
  },
  users: {
    all: [],
    WWS_IPG: [],
    WWS_SPG: [],
    WWS_Services: [],
  },
  userTenderData: [],
  tenderStatusCount: {
    Succeeded: 0,
    Failed: 0,
    ["No file processed"]: 0,
    Processing: 0,
  },
  processingTimeData: [],
};

export const getTotalData = createAsyncThunk(
  "admin/getTotalData",
  async (_, thunkAPI) => {
    try {
      const { admin } = thunkAPI.getState();

      const data = new FormData();
      data.append("from", admin.fromDate);
      data.append("to", admin.toDate);

      return await adminService.getTotalData(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const getUsersTenderData = createAsyncThunk(
  "admin/getUsersTenderData",
  async (data, thunkAPI) => {
    try {
      return await adminService.getUsersTenderData(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const getAverageProcessingTime = createAsyncThunk(
  "admin/getAverageProcessingTime",
  async (_, thunkAPI) => {
    try {
      return await adminService.getAverageProcessingTime();
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const adminSlice = createSlice({
  name: "admin",
  initialState,

  reducers: {
    dateSetter: (state, action) => {
      const { type, value } = action.payload;

      type === "from" ? (state.fromDate = value) : (state.toDate = value);
    },

    resetAdminData: (state) => {
      const data = {
        ...initialState,
        processingTimeData: state.processingTimeData,
      };

      return data;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getTotalData.pending, (state) => {
      state.isLoading = true;
      // state.dataNotFound = false;
    });
    builder.addCase(getTotalData.fulfilled, (state, action) => {
      const data = action.payload;
      // state.dataNotFound = false;

      state.isLoading = false;
      state.totalPages = data.total_pages_processed;
      state.totalTendors = data.total_tenders_processed;
      state.totalUsers = data.user_data_dict?.user_count;

      state.users = {
        all: ["All"],
        WWS_IPG: ["All"],
        WWS_SPG: ["All"],
        WWS_Services: ["All"],
      };

      const userList = Object.values(data.user_data_dict.user_dict);

      userList.forEach((user) => {
        state.users.all.push(user.username);

        user.division.forEach((dv) => {
          state.users[`${dv}`].push(user.username);
        });
      });

      state.tenders = {
        WWS_SPG: {
          pages: 0,
          tenders: 0,
        },
        WWS_IPG: {
          pages: 0,
          tenders: 0,
        },
        WWS_Services: {
          pages: 0,
          tenders: 0,
        },
      };

      data.total_tenders_and_pages_processed_division_wise.forEach((t) => {
        state.tenders[`${t["_id"]}`] = {
          pages: t.total_pages_processed_within_range,
          tenders: t.total_tenders_processed_within_range,
        };
      });
    });
    builder.addCase(getTotalData.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(getUsersTenderData.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(getUsersTenderData.fulfilled, (state, action) => {
      const { user_data, tender_status_count } = action.payload;

      state.isLoading = false;

      const list = Object.keys(user_data);

      state.userTenderData = [];

      list.forEach((dv) => {
        user_data[`${dv}`].forEach((t) => {
          state.userTenderData.push(t);
        });
      });

      state.tenderStatusCount = tender_status_count;
    });

    builder.addCase(getUsersTenderData.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(getAverageProcessingTime.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(getAverageProcessingTime.fulfilled, (state, action) => {
      const data = action.payload;

      state.isLoading = false;
      state.processingTimeData = data;
    });

    builder.addCase(getAverageProcessingTime.rejected, (state) => {
      state.isLoading = false;
    });
  },
});

const { actions } = adminSlice;

export const { dateSetter, resetAdminData } = actions;

export default adminSlice.reducer;

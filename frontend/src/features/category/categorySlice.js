import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import categoryService from "./categoryService";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { getErrorToast } from "../../utils/useToast";

const initialState = {
  categoryData: {},
  isLoading: false,
  cumulativeFileId: "",
};

export const downloadPDF = createAsyncThunk(
  "category/downloadPDF",
  async (data, thunkAPI) => {
    try {
      console.log(data);

      const state = thunkAPI.getState();

      const tenderName = state.upload.tenderName;

      data.tenderName = tenderName;

      return await categoryService.downloadPDF(data);
    } catch (error) {
      const err = JSON.parse(await error.response.data.text());

      getErrorToast(err.error);

      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const downloadDOCX = createAsyncThunk(
  "category/downloadDOCX",
  async (data, thunkAPI) => {
    try {
      console.log(data);

      const state = thunkAPI.getState();

      const tenderName = state.upload.tenderName;

      data.tenderName = tenderName;

      return await categoryService.downloadDOCX(data);
    } catch (error) {
      const err = JSON.parse(await error.response.data.text());

      getErrorToast(err.error);

      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const downloadXLSX = createAsyncThunk(
  "category/downloadXLSX",
  async (data, thunkAPI) => {
    try {
      const state = thunkAPI.getState();

      const tenderName = state.upload.tenderName;

      data.tenderName = tenderName;

      return await categoryService.downloadXLSX(data);
    } catch (error) {
      const err = JSON.parse(await error.response.data.text());

      getErrorToast(err.error);

      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const downloadCumulativeFile = createAsyncThunk(
  "category/downloadCumulativeFile",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();

      const tenderName = state.upload.tenderName;
      const fileId = state.category.cumulativeFileId;

      const data = {
        tenderName: tenderName,
        fileId: fileId,
      };

      console.log(data);

      return await categoryService.downloadCumulativeFile(data);
    } catch (error) {
      const err = JSON.parse(await error.response.data.text());

      getErrorToast(err.error);

      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchCumulitiveId = createAsyncThunk(
  "category/merge-docx-view/",
  async (data, thunkAPI) => {
    try {
      return await categoryService.fetchCumulitiveId(data);
    } catch (error) {
      const err = JSON.parse(await error.response.data.text());

      getErrorToast(err.error);

      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const categorySlice = createSlice({
  name: "categroy",
  initialState,
  reducers: {
    addCategoryData: (state, action) => {
      state.categoryData = { ...action.payload };
    },

    storeCumulativeId: (state, action) => {
      console.log(action.payload);

      state.cumulativeFileId = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(downloadPDF.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(downloadPDF.fulfilled, (state) => {
      state.isLoading = false;
    });

    builder.addCase(downloadPDF.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(downloadDOCX.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(downloadDOCX.fulfilled, (state) => {
      state.isLoading = false;
    });

    builder.addCase(downloadDOCX.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(downloadXLSX.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(downloadXLSX.fulfilled, (state) => {
      state.isLoading = false;
    });

    builder.addCase(downloadXLSX.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(fetchCumulitiveId.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(fetchCumulitiveId.fulfilled, (state, action) => {

      console.log(action);

      state.isLoading = false;
      state.cumulativeFileId = action.payload.Merge_docx.merge_docx_id;
    });

    builder.addCase(fetchCumulitiveId.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(downloadCumulativeFile.pending, (state) => {
      state.isLoading = true;
    });

    builder.addCase(downloadCumulativeFile.fulfilled, (state) => {
      state.isLoading = false;
    });

    builder.addCase(downloadCumulativeFile.rejected, (state) => {
      state.isLoading = false;
    });
  },
});

// const { actions } = categorySlice;

export const { addCategoryData, storeCumulativeId } = categorySlice.actions;

export default categorySlice.reducer;

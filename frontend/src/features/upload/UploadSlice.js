import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import uploadService from "./UploadService";
import { getErrorMessage } from "../../utils/getErrorMessage";

const initialState = {
  srNo: "",
  tenderNo: "",
  tenderName: "",
  publishedDate: "",
  uploadDate: "",
  fileUploadStatus: "",
  tenderStatus: "",
  uploadedBy: "",

  tenderFiles: [],
  fileQueue: [],
  totalFiles: 0,
  currentUploadedFiles: 0,

  succeededFileList: [],
  isLoading: false,
  isUploading: false,
  isFetching: false,
  sendQueue: false,
};

export const addTenderMetaData = createAsyncThunk(
  "upload/addTenderMetaData",
  async (data, thunkAPI) => {
    try {
      return await uploadService.addTenderMetaData(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const uploadTenderFiles = createAsyncThunk(
  "upload/uploadTenderFiles",
  async (data, thunkAPI) => {
    try {
      return await uploadService.uploadTenderFiles(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteFile = createAsyncThunk(
  "upload/deleteFile",
  async (data, thunkAPI) => {
    try {
      return await uploadService.deleteFile(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchListFiles = createAsyncThunk(
  "upload/fetchListFiles",
  async (data, thunkAPI) => {
    try {
      return await uploadService.fetchListFiles(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const downloadUploadedFiles = createAsyncThunk('upload/downloadUploadedFiles', async (data, thunkAPI) => {
  try {
    return await uploadService.downloadUploadedFiles(data);
  } catch (error) {
    return thunkAPI.rejectWithValue({
      message: getErrorMessage(error),
      status: err.response.status
    });
  }
})

export const uploadSlice = createSlice({
  name: "upload",
  initialState,
  reducers: {
    resetTenderFiles: (state) => {
      state.tenderFiles = [];
    },

    appendTenderFile: (state, action) => {
      state.tenderFiles.push(action.payload);
    },

    updateFileUploadStatus: (state, action) => {
      const file = action.payload;

      for (let i = 0; i < state.tenderFiles.length; i++) {
        if (state.tenderFiles[i].file_name === file.original_file_name) {
          state.tenderFiles[i] = {
            ...file,
          };
          break;
        }
      }
    },

    modifyUploadStatus: (state, action) => {
      const { id, status } = action.payload;

      for (let i = 0; i < state.tenderFiles.length; i++) {
        if (id === state.tenderFiles[i].id) {
          state.tenderFiles[i].uploadStatus = status;

          break;
        }
      }
    },

    removeFiles: (state, action) => {
      const fileId = action.payload;

      console.log(fileId);

      const data = state.tenderFiles.filter((file) => file.id !== fileId);

      console.log(data);

      state.tenderFiles = data;
      state.totalFiles = state.totalFiles - 1;
    },

    setTotalFilesCount: (state, action) => {
      const length = action.payload;

      state.totalFiles = length;
    },

    updateFileQueueAndCurrFileCount: (state, action) => {
      const id = action.payload;

      state.fileQueue.push(id);

      state.currentUploadedFiles = state.currentUploadedFiles + 1;
    },

    resetQueueAndCount: (state) => {
      state.fileQueue = [];
      state.totalFiles = 0;
      state.currentUploadedFiles = 0;
    },

    updateFileProcessStatus: (state, action) => {
      const data = action.payload;

      if (
        data.tender_name === state.tenderName &&
        data.tender_number === state.tenderNo
      ) {
        for (let i = 0; i < state.tenderFiles.length; i++) {
          state.tenderFiles[i].file_processing_status = "Succeeded";
        }
      }
    },

    updateTenderStatus: (state, action) => {
      const data = action.payload;

      if (
        state.tenderName === data.tender_name &&
        state.tenderNo === data.tender_number
      ) {
        state.tenderStatus = "Succeeded";
      }
    },

    updateIsUploadingStatus: (state) => {
      state.isUploading = false;
    },

    updateTenderDetails: (state, action) => {
      state.tenderNo = action.payload.tender_number;
      state.tenderName = action.payload.tender_name;
      state.srNo = action.payload.sr_no;
      state.publishedDate = action.payload.published_date;
      state.uploadDate = action.payload.uploaded_date;
      state.fileUploadStatus = action.payload.file_upload_status;
      state.tenderStatus = action.payload.tender_status;
      state.uploadedBy = action.payload.uploaded_by;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(addTenderMetaData.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(addTenderMetaData.fulfilled, (state, action) => {
      const {
        sr_no,
        tender_number,
        tender_name,
        published_date,
        uploaded_date,
        file_upload_status,
        tender_status,
        uploaded_by,
      } = action.payload;

      state.srNo = sr_no;
      state.tenderName = tender_name;
      state.tenderNo = tender_number;
      state.publishedDate = published_date;
      state.uploadDate = uploaded_date;
      state.isLoading = false;
      state.fileUploadStatus = file_upload_status;
      state.tenderStatus = tender_status;
      state.uploadedBy = uploaded_by;
      state.tenderFiles = [];
    });
    builder.addCase(addTenderMetaData.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(uploadTenderFiles.pending, (state) => {
      state.isLoading = true;
      state.isUploading = true;
    });
    builder.addCase(uploadTenderFiles.fulfilled, (state) => {
      state.isLoading = false;
      state.isUploading = false;
      state.sendQueue = true;
    });
    builder.addCase(uploadTenderFiles.rejected, (state) => {
      state.isLoading = false;
      state.isUploading = false;
    });

    builder.addCase(deleteFile.pending, (state) => {
      state.isLoading = true;
      state.isUploading = true;
    });
    builder.addCase(deleteFile.fulfilled, (state) => {
      state.isLoading = false;
      state.isUploading = false;
    });
    builder.addCase(deleteFile.rejected, (state) => {
      state.isLoading = false;
      state.isUploading = false;
    });

    builder.addCase(downloadUploadedFiles.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(downloadUploadedFiles.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(downloadUploadedFiles.rejected, (state) => {
      state.isLoading = false;
    });

    builder.addCase(fetchListFiles.pending, (state) => {
      state.isFetching = true;
    });
    builder.addCase(fetchListFiles.fulfilled, (state, action) => {
      state.isFetching = false;
      state.succeededFileList = action.payload;
    });
    builder.addCase(fetchListFiles.rejected, (state) => {
      state.isFetching = false;
    });
  },
});

const { actions } = uploadSlice;

export const {
  appendTenderFile,
  updateFileUploadStatus,
  updateFileProcessStatus,
  updateIsUploadingStatus,
  updateTenderDetails,
  resetTenderFiles,
  updateTenderStatus,
  modifyUploadStatus,
  removeFiles,
  setTotalFilesCount,
  updateFileQueueAndCurrFileCount,
  resetQueueAndCount
} = actions;

export default uploadSlice.reducer;

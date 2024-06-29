import { configureStore } from "@reduxjs/toolkit";
import exampleReducer from "../features/example/exampleSlice";
import authReducer from "../features/auth/authSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";
import uploadReducer from "../features/upload/UploadSlice";
import categoryReducer from "../features/category/categorySlice";
import adminReducer from "../features/admin/adminSlice";

export const store = configureStore({
  reducer: {
    example: exampleReducer,
    auth: authReducer,
    dashboard: dashboardReducer,
    upload: uploadReducer,
    category: categoryReducer,
    admin: adminReducer
  },
});

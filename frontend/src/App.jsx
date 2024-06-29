import { Routes, Route } from "react-router-dom";

import Main from "src/pages/Main";
import Auth from "src/pages/Auth";
import NotFound from "src/components/common/NotFound";
import AuthEmailLogin from "src/components/auth/authEmailLogin";
import AuthResetPassword from "src/components/auth/authResetPassword";
import Page from "./pages/Page";
import Dashboard from "./components/home/dashboard/Dashboard";
import Upload from "./components/home/upload/Upload";
import UploadNewTender from "./components/home/upload/uploadNewTender";
import TenderFiles from "./components/home/tenderFiles/TenderFiles";
import UploadFiles from "./components/home/upload/uploadFiles";
import FileContainer from "./components/home/fileList/FileList";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Category from "./components/home/category/Category";
import AuthForgotPassword from "./components/auth/authForgotPassword";
import AuthConfirmForgotPassowrd from "./components/auth/authConfirmForgotPassowrd";
import Admin from "./components/home/admin/Admin";
import AdminDashboard from "./components/home/admin/dashboard/AdminDashboard";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route element={<Main />} path="/" />
        <Route element={<Auth />} path="/auth">
          <Route index element={<AuthEmailLogin />} />
          <Route element={<AuthEmailLogin />} path="/auth/sign-in" />
          <Route element={<AuthResetPassword />} path="/auth/reset-password" />
          <Route
            element={<AuthConfirmForgotPassowrd />}
            path="/auth/password/confirm/:uid/:token/"
          />
          <Route
            element={<AuthForgotPassword />}
            path="/auth/forgot-password"
          />
        </Route>
        <Route element={<NotFound />} path="*" />
        <Route
          element={
            <ProtectedRoute>
              <Page />
            </ProtectedRoute>
          }
          path="/page"
        >
          <Route element={<Dashboard />} path="/page/dashboard" />
          <Route element={<Upload />} path="/page/upload">
            <Route element={<UploadNewTender />} index />
            <Route element={<UploadFiles />} path="/page/upload/upload-files" />
            <Route
              element={<UploadNewTender />}
              path="/page/upload/new-tender"
            />
          </Route>
          <Route element={<Admin />} path="/page/admin">
            <Route element={<AdminDashboard />} path="/page/admin/dashboard" />
          </Route>
          <Route element={<TenderFiles />} path="/page/tender-files" />
          <Route element={<Category />} path="/page/category" />
          <Route element={<FileContainer />} path="/page/file-list" />
        </Route>
      </Routes>
    </div>
  );
}

export default App;

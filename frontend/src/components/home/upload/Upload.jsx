import React from "react";

import { Outlet } from "react-router-dom";

import "../../../assets/css/Upload.css";

const Upload = () => {
  return (
    <div className="upload_page-main-container">
      <Outlet />
    </div>
  );
};

export default Upload;

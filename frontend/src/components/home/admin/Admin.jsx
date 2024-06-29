import React from "react";
import { Outlet } from "react-router-dom";
import "../../../assets/css/Admin.css";

const Admin = () => {
  return (
    <div
      style={{ maxHeight: "-webkit-fill-available" }}
      className="admin sub-page"
    >
      <Outlet />
    </div>
  );
};

export default Admin;

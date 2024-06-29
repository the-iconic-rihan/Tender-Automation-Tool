import React from "react";
import { Navigate } from "react-router-dom";

const Main = () => {
  return (
    <div className="page">
      <h1 className="center" style={{ padding: "1rem 0" }}>
        Thermax
      </h1>
      <Navigate to="/auth" />
    </div>
  );
};

export default Main;

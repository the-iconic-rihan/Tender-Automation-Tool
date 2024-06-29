import React from "react";
import DashboardData from "./DashboardData";
import DashboardTable from "./DashboardTable";
import "../../../assets/css/Dashboard.css";

const Dashboard = () => {
  // const socket = new WebSocket("ws://localhost:8000/ws/file_upload/");
  // socket.onopen = () => {
  //   console.log("ESTABLISHED");
  // };

  // socket.onmessage = e => {
  //   console.log(e);
  // }
  return (
    <>
    <div className="dashboard-container sub-page">
      <DashboardData />
      <DashboardTable />
    </div>
  
    </>
  );
};

export default Dashboard;

import React, { useEffect, useState } from "react";

import axios from "axios";

import "../../../assets/css/TenderFiles.css";
import Table from "../../common/Table";

import Select from "react-select";

import { useDispatch, useSelector } from "react-redux";
import {
  appendTender,
  filterTenders,
  getTenderFiles,
  updateTender,
} from "../../../features/dashboard/dashboardSlice";
import { getISTDate } from "../../../utils/dateFormats";
import { useNavigate } from "react-router-dom";
import { dashboardColumnData } from "../../../utils/tableColumns";
import { useWebSocketContext } from "../../../utils/WebSocketContext";

const options = [
  { value: "published_date", label: "Published Date" },
  { value: "uploaded_date", label: "Uploaded Date" },
];

const TenderFiles = () => {
  const [tenderFilesFilter, setTenderFilesFilter] = useState("");
  const [columnsFilter, setColumnFilters] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dateType, setDateType] = useState("");
  const [viewClearBtn, setViewClearBtn] = useState(false);

  const { readyState, closeWSConnection } = useWebSocketContext();

  const navigate = useNavigate();

  const { user, dashboard } = useSelector(
    (state) => {
      return {
        user: state.auth,
        dashboard: state.dashboard,
      };
    },
    (a, b) => {
      return a.user === b.user && a.dashboard === b.dashboard;
    }
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getTenderFiles(user.division));

    // axios.get(
    //   `${import.meta.env.VITE_BACKEND_URL}/dashboard/get-data/${user.division}`
    // );

    // const eventSource = new EventSource(
    //   `${import.meta.env.VITE_BACKEND_URL}/dashboard/poll/`,
    //   {
    //     withCredentials: true,
    //   }
    // );

    // eventSource.addEventListener("message", (e) => {
    //   const data = JSON.parse(e.data);

    //   console.log(data);

    //   if (data.operationType === "insert") {
    //     delete data.operationType;

    //     dispatch(appendTender(data));
    //   } else if (data.operationType === "update") {
    //     delete data.operationType;

    //     dispatch(updateTender(data));
    //   }
    // });

    // return () => {
    //   eventSource.close();
    // };
  }, [user.division]);

  const searchHandler = (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("division", user.division);
    formData.append("from", fromDate);
    formData.append("to", toDate);
    formData.append("date_type", dateType);

    dispatch(filterTenders(formData));
    setViewClearBtn(true);
  };

  return (
    <div className="tender_files-main-container">
      <div className="tf-header-container">
        <div className="tf_header-heading-container">
          <h3>Tender List</h3>
        </div>
        <div className="tf_hrader-btn-container">
          <button
            disabled={dashboard.isLoading || readyState !== 1}
            onClick={() => navigate("/page/upload")}
            className="btn"
          >
            + New Tender
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          width: "100%",
          gap: "1rem",
        }}
      >
        <form className="tf_filter-container" onSubmit={searchHandler}>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            min="2000-01-01"
            max={getISTDate()}
            required
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            min="2000-01-01"
            max={getISTDate()}
            required
          />

          <Select
            required
            options={options}
            onChange={(e) => setDateType(e.value)}
          />

          <button
            className="btn"
            style={{
              color: "#186daa",
              backgroundColor: "#fff",
              border: "1px solid #186daa",
            }}
          >
            Search
          </button>
        </form>
        {viewClearBtn && (
          <button
            onClick={() => {
              dispatch(getTenderFiles(user.division));

              setViewClearBtn(false);
              setFromDate("");
              setToDate("");
              setDateType("");
            }}
            style={{
              color: "#186daa",
              backgroundColor: "#fff",
              border: "1px solid #186daa",
              padding: "0.15rem 1rem",
            }}
            className="btn"
          >
            Clear
          </button>
        )}
        {user.username.includes("omangmorekar68@gmail.com") && (
          <button
            style={{
              width: "125px",
              backgroundColor: "#fff",
              color: "#186daa",
              border: "1px solid #186daa",
            }}
            onClick={closeWSConnection}
            className="btn"
          >
            Close WS
          </button>
        )}
      </div>

      <div className="tf_table-container">
        {dashboard.isLoading ? (
          <p>Loading...</p>
        ) : (
          <Table
            columnData={dashboardColumnData}
            tableData={dashboard.tenderFiles}
            columnFilters={columnsFilter}
            setColumnFilters={setColumnFilters}
            filterValue={tenderFilesFilter}
            setFilterValue={setTenderFilesFilter}
            rowsPerPage={10}
            canNavigate={true}
            resetTableDataOnChange={true}
          />
        )}
      </div>
    </div>
  );
};

export default TenderFiles;

import React, { useState, useEffect } from "react";

import "../../../assets/css/dashboardTable.css";
import DebouncedInput from "../../common/DebouncedInput";
import { useDispatch, useSelector } from "react-redux";
import {
  appendTender,
  filterTenders,
  getTenderFiles,
  updateTender,
} from "../../../features/dashboard/dashboardSlice";
import Table from "../../common/Table";
import { useNavigate } from "react-router-dom";
import { dashboardColumnData } from "../../../utils/tableColumns";
import { getISTDate } from "../../../utils/dateFormats";

import Select from "react-select";

const options = [
  { value: "published_date", label: "Published Date" },
  { value: "uploaded_date", label: "Uploaded Date" },
];

const DashboardTable = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnsFilter, setColumnFilters] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dateType, setDateType] = useState("");
  const [viewClearBtn, setViewClearBtn] = useState(false);

  const dispatch = useDispatch();
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

  useEffect(() => {
    dispatch(getTenderFiles(user.division));

    // axios.get(
    //   `${import.meta.env.VITE_BACKEND_URL}/dashboard/get-data/${user.division}`
    // )

    //   const eventSource = new EventSource(
    //     `${import.meta.env.VITE_BACKEND_URL}/dashboard/poll/`,
    //     {
    //       withCredentials: true,
    //     }
    //   );

    //   eventSource.addEventListener("message", (e) => {
    //     const data = JSON.parse(e.data);
    //     console.log(e);
    //     if (data.operationType === "insert") {
    //       delete data.operationType;

    //       dispatch(appendTender(data));
    //     } else if (data.operationType === "update") {
    //       delete data.operationType;

    //       dispatch(updateTender(data));
    //     }
    //   });

    //   return () => {
    //     eventSource.close();
    //   };
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

  const styles = {
    menu: (styles) => {
      return {
        ...styles,
        zIndex: 100,
      };
    },
  };

  return (
    <div className="dashboard-table-container">
      <div className="dt-heading-container">
        <h3>Recent Entries</h3>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
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
              styles={styles}
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
        </div>
      </div>

      <div className="dahboard_table-wrapper">
        {dashboard.isLoading ? (
          <p>Loading...</p>
        ) : (
          <Table
            columnData={dashboardColumnData}
            tableData={dashboard.tenderFiles}
            columnFilters={columnsFilter}
            setColumnFilters={setColumnFilters}
            filterValue={globalFilter}
            setFilterValue={setGlobalFilter}
            viewPaginationBtn={true}
            canNavigate={true}
            rowsPerPage={10}
            resetTableDataOnChange={true}
          />
        )}
      </div>

      <div className="dashboard_table-btn-container">
        <button onClick={() => navigate("/page/tender-files")} className="btn">
          View All
        </button>
      </div>
    </div>
  );
};

export default DashboardTable;

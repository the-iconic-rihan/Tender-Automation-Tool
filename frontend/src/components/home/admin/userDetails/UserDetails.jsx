import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import Modal from "../../../common/Modal";
import "../../../../assets/css/UserDetails.css";
import userImg from "../../../../assets/images/user-details-header-img.svg";
import { useEffect } from "react";
import { getUsersTenderData } from "../../../../features/admin/adminSlice";
import Table from "../../../common/Table";
import { userDetailsColumnData } from "../../../../utils/tableColumns";

const UserDetails = ({ modalState, setModalCloseFunc }) => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnsFilter, setColumnFilters] = useState([]);
  const [dvType, setDvType] = useState("all");
  const [userName, setUserName] = useState("");
  const adminData = useSelector((state) => state.admin);
  const dispatch = useDispatch();

  useEffect(() => {
    const data = new FormData();
    data.append("username", "");
    data.append("division", "");
    data.append("from_date", adminData.fromDate);
    data.append("to_date", adminData.toDate);

    dispatch(getUsersTenderData(data))
      .unwrap()
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const fetchUserHandler = () => {
    const data = new FormData();
    if (dvType === "all") {
      data.append("division", "");
    } else {
      data.append("division", dvType);
    }

    userName === "All"
      ? data.append("username", "")
      : data.append("username", userName);

    data.append("from_date", adminData.fromDate);
    data.append("to_date", adminData.toDate);

    dispatch(getUsersTenderData(data));
  };

  const data = [
    {
      name: "Succeeded",
      value: adminData.tenderStatusCount["Succeeded"],
    },
    {
      name: "Processing",
      value: adminData.tenderStatusCount["Processing"],
    },
    {
      name: "No file processed",
      value: adminData.tenderStatusCount["No file processed"],
    },
    {
      name: "Failed",
      value: adminData.tenderStatusCount["Failed"],
    },
  ];

  const COLORS = [
    { start: "#73C255", end: "#078575" },
    { start: "#186DAA", end: "#4FAADD" },
    { start: "#FE5F2B", end: "#FDAF27" },
    { start: "#EF0107", end: "#660000" },
  ];

  return (
    <Modal
      isOpen={modalState}
      onClose={() => setModalCloseFunc(false)}
      closeOnOverlayClick={false}
      style={{
        width: "90vw",
        height: "90vh",
        maxWidth: "2000px",
        maxHeight: "1000px",
        background: "linear-gradient(145deg, #D2D2D2, #F4F5FF 30%)",
        border: "none",
      }}
      id="user-modal"
    >
      <div className="user-details-container">
        <div className="ad-us-dt-c1">
          <div className="usdt-select-container">
            <div className="usdt-sel-actions">
              <h3>User Details!</h3>
              <div className="usdt-sel-act-con">
                <div className="usdt-sel">
                  <label htmlFor="ad-usdt-profile">Profile</label>
                  <select
                    name=""
                    onChange={(e) => setDvType(e.target.value)}
                    id="ad-usdt-profile"
                    style={{ width: "125px" }}
                  >
                    <option value="all">All</option>
                    <option value="WWS_SPG">WWS_SPG</option>
                    <option value="WWS_IPG">WWS_IPG</option>
                    <option value="WWS_Services">WWS_Services</option>
                  </select>
                </div>

                <div className="usdt-sel">
                  <label htmlFor="ad-usdt-user">Users</label>
                  <select
                    onChange={(e) => {
                      console.log(e.target.value);

                      setUserName(e.target.value);
                    }}
                    id="ad-usdt-user"
                  >
                    {adminData.users[`${dvType}`].map((user, index) => (
                      <option key={index} value={user}>
                        {user}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="usdt-sel">
                  <label style={{ color: "transparent" }}>Apply</label>
                  <button onClick={fetchUserHandler} className="btn">
                    Apply
                  </button>
                </div>
              </div>
            </div>
            <div className="usdt-sel-image">
              <img src={userImg} alt="" />
            </div>
          </div>
          <div className="usdt-graph-container">
            <div className="usdt-graph-legend-section">
              <div className="usdt-graph-legend-header">
                <small>Tender Statistics</small>
                <p>
                  {Object.values(adminData.tenderStatusCount).reduce(
                    (acc, curr) => acc + curr,
                    0
                  )}
                </p>
              </div>
              <div className="usdt-g-legend-data">
                <p className="usdt-legend-sign-succeeded">
                  <b>{adminData.tenderStatusCount["Succeeded"] ?? 0}</b>
                  Succeeded
                </p>
                <p className="usdt-legend-sign-processing">
                  <b>{adminData.tenderStatusCount["Processing"] ?? 0}</b>
                  Processing
                </p>
                <p className="usdt-legend-sign-nfu">
                  <b>{adminData.tenderStatusCount["No file processed"] ?? 0}</b>
                  No File Processed
                </p>
                <p className="usdt-legend-sign-failed">
                  <b>{adminData.tenderStatusCount["Failed"] ?? 0}</b>Failed
                </p>
              </div>
            </div>
            <div className="usdt-graph-container">
              <ResponsiveContainer>
                <PieChart>
                  <defs>
                    {data.map((entry, index) => (
                      <linearGradient
                        key={index}
                        id={`userDetails-myGradient${index}`}
                      >
                        <stop
                          offset="0%"
                          stopColor={COLORS[index % COLORS.length].start}
                        />
                        <stop
                          offset="100%"
                          stopColor={COLORS[index % COLORS.length].end}
                        />
                      </linearGradient>
                    ))}
                  </defs>
                  <Tooltip />
                  <Pie
                    data={data}
                    innerRadius={40}
                    outerRadius={60}
                    fill="#8884d8"
                    paddingAngle={0}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#userDetails-myGradient${index})`}
                        style={{
                          fontFamily: "monospace",
                          fontWeight: 700,
                        }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="ad-us-dt-table-container">
          <Table
            columnData={userDetailsColumnData}
            tableData={adminData.userTenderData}
            columnFilters={columnsFilter}
            setColumnFilters={setColumnFilters}
            filterValue={globalFilter}
            setFilterValue={setGlobalFilter}
            viewPaginationBtn={true}
            canNavigate={false}
            rowsPerPage={10}
            resetTableDataOnChange={true}
          />
        </div>
      </div>
    </Modal>
  );
};

export default UserDetails;

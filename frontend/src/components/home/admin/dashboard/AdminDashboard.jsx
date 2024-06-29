import React, { useState } from "react";
import "../../../../assets/css/AdminDashboard.css";
import searchIcon from "../../../../assets/images/search_icon_white.svg";
import dashboardImage from "../../../../assets/images/dashboard_upload_img.svg";
import AnalysisCard from "./AnalysisCard";
import ProcessingTimeCard from "./ProcessingTimeGraph";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import {
  dateSetter,
  getAverageProcessingTime,
  getTotalData,
  resetAdminData,
} from "../../../../features/admin/adminSlice";
import { formattedDate, getISTDate } from "../../../../utils/dateFormats";
import PagesProcessed from "./PagesProcessed";
import TendersProcessed from "./TendersProcessed";
import UserDetails from "../userDetails/UserDetails";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const adminData = useSelector((state) => state.admin);
  const user = useSelector((state) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTotalData = () => {
    dispatch(getTotalData())
      .unwrap()
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchTotalData();

    dispatch(getAverageProcessingTime());
  }, []);

  const displayUserDetails = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="admin-dashboard">
      <div className="ad-header">
        <div className="adh-filter-container">
          <div className="adh-input-container">
            <label htmlFor="adh-form-from">From</label>
            <input
              onChange={(e) =>
                dispatch(
                  dateSetter({
                    type: "from",
                    value: e.target.value,
                  })
                )
              }
              type="date"
              id="adh-form-from"
              // value={adminData.fromDate}
              min="2023-01-01"
              max={adminData.toDate}
              defaultValue={adminData.fromDate}
            />
          </div>
          <div className="adh-input-container">
            <label htmlFor="adh-form-to">To</label>
            <input
              type="date"
              id="adh-form-to"
              onChange={(e) =>
                dispatch(
                  dateSetter({
                    type: "to",
                    value: e.target.value,
                  })
                )
              }
              min={adminData.fromDate}
              max={getISTDate()}
              // value={adminData.toDate}
              defaultValue={adminData.toDate}
            />
          </div>
          <div className="adh-search-container">
            <button onClick={fetchTotalData} className="btn">
              Search <img src={searchIcon} alt="" />
            </button>
          </div>
        </div>
        <div className="adh-data-container">
          <div className="adh-data-text-container">
            <p>
              Welcome back, <span>{user?.username?.split("@")[0]}</span>
            </p>
            <small>{`Usage from ${formattedDate(
              adminData.fromDate
            )} till ${formattedDate(adminData.toDate)}`}</small>
          </div>
          <div className="adh-data-img-container">
            <img src={dashboardImage} alt="" />
          </div>
        </div>
      </div>
      <div className="ad-main">
        <div className="adm-container-1">
          <div className="adm-c1-analysis-container">
            <AnalysisCard onViewDetailsHandler={displayUserDetails} />
          </div>
          <div className="adm-c1-processing-time-container">
            <PagesProcessed />
          </div>
        </div>
        <div className="adm-container-2">
          <div className="adm-c2-pages-processed-container">
            <ProcessingTimeCard />
          </div>
          <div className="adm-c2-tenders-processed-container">
            <TendersProcessed />
          </div>
        </div>
      </div>
      {isModalOpen && (
        <UserDetails
          modalState={isModalOpen}
          setModalCloseFunc={setIsModalOpen}
        />
      )}
    </div>
  );
};

export default AdminDashboard;

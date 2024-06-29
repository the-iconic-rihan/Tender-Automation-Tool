import { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import "../../../assets/css/dashboardData.css";
import dashboardImage from "../../../assets/images/dashboard_upload_img.svg";
import dashboardUploadedImage from "../../../assets/images/dashboard_uploaded_image.svg";

import processedPageImage from "../../../assets/images/processed_pages_image.svg";
import { fetchProcessedPagesData } from "../../../features/dashboard/dashboardSlice";
import { formatCompactNumber } from "../../../utils/compactNumber";
import { useWebSocketContext } from "../../../utils/WebSocketContext";

const DashboardData = () => {
  const dispatch = useDispatch();
  const { readyState } = useWebSocketContext();

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
    dispatch(fetchProcessedPagesData(user.division));
  }, [user.division]);

  const navigate = useNavigate();

  return (
    <div className="dashboard_data-container">
      <div className="dd-new-tender-container">
        <div className="dd_nt-action-container">
          <p className="dd-tender-welcome-message">
            Welcome back &gt; <span>{user?.username?.split("@")[0]}</span>
          </p>
          <button
            style={{ padding: "0.5rem 0.75rem", width: "fit-content" }}
            className="btn"
            onClick={() => navigate("/page/upload")}
            disabled={dashboard.isLoading || readyState !== 1}
          >
            + New Tender
          </button>
          <p className="dd-btn-desc">Add new Tender document</p>
        </div>
        <div className="dd_nt-image-container">
          <img src={dashboardImage} alt="dashboard-img" />
        </div>
      </div>
      <div className="dd-uploaded-tender-container">
        <div className="dd_ut-data-container">
          <h3 className="dd_ut-data">
            {dashboard.isLoading ? "..." : `${dashboard.uploadedTenders}`}
          </h3>
          <p className="dd_ut-data-desc">
            Tenders <br /> Uploaded
          </p>
        </div>
        <div className="dd_ut-img-container">
          <img src={dashboardUploadedImage} alt="dsahboard-uploaded-imge" />
        </div>
      </div>
      <div className="dd-total-pages-processed-container">
        <div className="dd_total-pages-data">
          <h3>
            {dashboard.isLoading ? (
              <span>...</span>
            ) : (
              `${formatCompactNumber(dashboard.processedPages)}`
            )}
          </h3>
          <p>
            Pages <br />
            Processed
          </p>
        </div>
        <div className="dd_total-pages-image-container">
          <img src={processedPageImage} alt="" />
        </div>
      </div>
    </div>
  );
};

export default DashboardData;

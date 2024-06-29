import React from "react";
import "../../../../assets/css/AnalysisCard.css";
import ana from "../../../../assets/images/ana.svg";
import tenderImg from "../../../../assets/images/tender-analysis.svg";
import pagesImg from "../../../../assets/images/pages-analysis.svg";
import { DisplaySlider } from "../../../common/Slider";
import { useSelector } from "react-redux";

const AnalysisCard = (props) => {
  const adminData = useSelector((state) => state.admin);

  const viewDetailsHandler = () => {
    props.onViewDetailsHandler();
  };

  return (
    <div className="analysis-card">
      <header className="analysis-card-header">
        <p>Daily Analysis</p>

        <button
          disabled={adminData.users.all.length < 1}
          onClick={viewDetailsHandler} className="an-cd-view-details-btn">
          View Details
        </button>
      </header>
      <main className="analysis-card-main-container">
        <AnalysisData
          header={"Users"}
          currentCount={adminData.totalUsers}
          totalCount={50}
          image={ana}
          hideMax={true}
        />
        <AnalysisData
          header={"Tenders"}
          currentCount={adminData.totalTendors}
          totalCount={50}
          image={tenderImg}
          hideMax={true}
        />
        <AnalysisData
          header={"Pages"}
          currentCount={adminData.totalPages}
          totalCount={5000}
          image={pagesImg}
        />
      </main>
    </div>
  );
};

export default AnalysisCard;

const AnalysisData = ({ header, currentCount, totalCount, image, hideMax }) => {
  return (
    <div className="ana-dt">
      <p className="ana-dt-header">{header}</p>
      <div className="ana-dt-main">
        <img src={image} alt="" />
        <div className="ana-data">
          <div className={`${hideMax && "ana-hide-max-text"} ana-data-text`}>
            <p>
              {currentCount} <span>{header}</span>
            </p>
            <p>{totalCount}</p>
          </div>
          <DisplaySlider
            min={0}
            max={totalCount}
            value={currentCount}
            trackStyle={{
              background: "#186daa",
              height: "8px",
              borderRadius: "6px",
            }}
            railStyle={{
              background: "#E9EDF7",
              height: "8px",
              borderRadius: "6px",
            }}
          />
        </div>
      </div>
    </div>
  );
};

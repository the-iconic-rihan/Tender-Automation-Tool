import React from "react";
import "../../../../assets/css/PagesProcessed.css";
import pages_pro from "../../../../assets/images/pages_processed_image.svg";
import { DisplaySlider } from "../../../common/Slider";
import { useSelector } from "react-redux";

const PagesProcessed = () => {
  const adminData = useSelector((state) => state.admin);

  return (
    <div className="pages-processed-container">
      <p className="pages-processed-header">Pages Processed</p>
      <div className="pg-pr-main-container">
        <DivsionData
          label="WWS_SPG"
          data={adminData.tenders["WWS_SPG"]["pages"]}
          totalCount={5000}
        />
        <DivsionData
          label="WWS_IPG"
          data={adminData.tenders["WWS_IPG"]["pages"]}
          totalCount={5000}
        />
        <DivsionData
          label="WWS_Services"
          data={adminData.tenders["WWS_Services"]["pages"]}
          totalCount={5000}
        />
      </div>
    </div>
  );
};

export default PagesProcessed;

const DivsionData = ({ label, data, totalCount }) => {
  return (
    <div className="pg-pr-div-container" id={label}>
      <img src={pages_pro} alt="" />
      <p>{label}</p>
      <DisplaySlider
        min={0}
        max={totalCount}
        value={data}
        trackStyle={{
          height: "10px",
          borderRadius: "8px",
        }}
        railStyle={{
          background: "#E9EDF7",
          height: "10px",
          borderRadius: "8px",
        }}
      />
      <p>{data}</p>
    </div>
  );
};

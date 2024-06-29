import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { addTenderMetaData } from "../../../features/upload/UploadSlice";

import "../../../assets/css/uploadNewTender.css";
import { getErrorToast } from "../../../utils/useToast";
import { useNavigate } from "react-router-dom";
import { getISTDate } from "../../../utils/dateFormats";

const UploadNewTender = () => {
  const dashboard = useSelector((state) => state.dashboard);
  const authState = useSelector((state) => state.auth);

  const [srNo, setSrNo] = useState(dashboard.uploadedTenders + 1);
  const [tenderNum, setTenderNum] = useState("");
  const [tenderName, setTenderName] = useState("");
  const [publishedDate, setPublishedDate] = useState("");
  const [uploadDate, setUploadDate] = useState(getISTDate());

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();

    const data = JSON.stringify({
      tender_name: tenderName,
      tender_number: tenderNum,
      division: authState.division,
      published_date: publishedDate,
      uploaded_by: authState.username,
      uploaded_date: uploadDate,
    });

    dispatch(addTenderMetaData(data))
      .unwrap()
      .then((res) => {
        navigate("/page/upload/upload-files");
      })
      .catch((err) => {
        getErrorToast(err);
      });
  };

  return (
    <div className="upload_tender-data-container">
      <h3 className="upload_tender-heading">New Tender Metadata</h3>
      <form
        onSubmit={submitHandler}
        className="upload_tender_form-grid-container"
      >
        <div className="sr_no-container">
          <label
            className="tender_upload-form-label"
            htmlFor="tender_upload-sr-no"
          >
            Sr. No
          </label>
          <input
            required
            className="tender_upload-input"
            type="number"
            id="tender_upload-sr-no"
            // value={srNo}
            // onChange={(e) => setSrNo(e.target.value)}
            disabled
          />
        </div>
        <div className="tender_no-container">
          <label
            className="tender_upload-form-label"
            htmlFor="tender_upload-tender-no"
          >
            Opportunity No
          </label>
          <input
            required
            className="tender_upload-input"
            type="text"
            id="tender_upload-tender-no"
            value={tenderNum}
            onChange={(e) => setTenderNum(e.target.value)}
          />
        </div>
        <div className="tender_name-container">
          <label
            className="tender_upload-form-label"
            htmlFor="tender_upload-tender-name"
          >
            Tender Name
          </label>
          <input
            required
            className="tender_upload-input"
            type="text"
            id="tender_upload-tender-name"
            value={tenderName}
            onChange={(e) => setTenderName(e.target.value)}
          />
        </div>
        <div className="publishing_date-container">
          <label
            className="tender_upload-form-label"
            htmlFor="tender_upload-pub-date"
          >
            Publishing Date
          </label>
          <input
            required
            type="date"
            className="tender_upload-input"
            id="tender_upload-pub-date"
            value={publishedDate}
            onChange={(e) => setPublishedDate(e.target.value)}
            max={getISTDate()}
            min="2000-01-01"
          />
        </div>
        <div className="uploading_date-container">
          <label
            className="tender_upload-form-label"
            htmlFor="tender_upload-upload-date"
          >
            Upload Date
          </label>
          <input
            required
            type="date"
            className="tender_upload-input"
            id="tender_upload-upload-date"
            value={uploadDate}
            onChange={(e) => setUploadDate(e.target.value)}
            max={getISTDate()}
            disabled
          />
        </div>
        <div className="center tender_submit-btn-container">
          <button className="btn">Next</button>
        </div>
      </form>
    </div>
  );
};

export default UploadNewTender;

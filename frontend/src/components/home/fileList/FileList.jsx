import React, { useEffect, useState } from "react";
import "../../../assets/css/FileList.css";
import DebouncedInput from "../../common/DebouncedInput";
import { useDispatch, useSelector } from "react-redux";
import Table from "../../common/Table";
import { useNavigate } from "react-router-dom";
import { fetchListFiles } from "../../../features/upload/UploadSlice";
import {
  fileColumnData,
  uploadingFileColumnData,
} from "../../../utils/tableColumns";

const FileContainer = () => {
  const [tenderFilesFilter, setTenderFilesFilter] = useState("");
  const [columnsFilter, setColumnFilters] = useState([]);

  const auth = useSelector((state) => state.auth);
  const upload = useSelector((state) => state.upload);
  const dispatch = useDispatch();

  const navigate = useNavigate("");

  useEffect(() => {
    if (
      !upload.tenderName ||
      upload.tenderStatus.toLowerCase() === "No file processed"
    ) {
      navigate("/page/dashboard");
    }

    if (
      upload.tenderStatus.toLowerCase() === "succeeded" ||
      upload.tenderStatus.toLowerCase() === "failed" ||
      (upload.tenderStatus.toLowerCase() === "processing" &&
        upload.tenderFiles[0]?.tender_name !== upload.tenderName)
    ) {
      const data = new FormData();

      data.append("division", auth.division);
      data.append("username", upload.uploadedBy);
      data.append("tender_name", upload.tenderName);
      data.append("tender_number", upload.tenderNo);

      dispatch(fetchListFiles(data));

      return;
    }
  }, [upload.tenderStatus]);

  return (
    <div className="file_list-main-container">
      <div className="fl-header-container">
        <h3>File List</h3>
        {/* <button disabled={upload.isUploading} className="btn">
          + New Files
        </button> */}
      </div>
      {/* <div className="fl-filter-container">
        <DebouncedInput
          value={tenderFilesFilter ?? ""}
          onChange={(value) => setTenderFilesFilter(String(value))}
          placeholder="Search"
        />
      </div> */}

      {upload.isFetching ? (
        <p>Loading...</p>
      ) : (
        <div className="fl-table-container">
          <Table
            columnData={
              upload.tenderStatus.toLowerCase() === "succeeded" ||
              upload.tenderStatus.toLowerCase() === "failed" ||
              (upload.tenderStatus.toLowerCase() === "processing" &&
                upload.tenderFiles[0]?.tender_name !== upload.tenderName)
                ? fileColumnData
                : uploadingFileColumnData
            }
            tableData={
              upload.tenderStatus.toLowerCase() === "succeeded" ||
              upload.tenderStatus.toLowerCase() === "failed" ||
              (upload.tenderStatus.toLowerCase() === "processing" &&
                upload.tenderFiles[0]?.tender_name !== upload.tenderName)
                ? upload.succeededFileList
                : upload.tenderFiles
            }
            filterValue={tenderFilesFilter}
            setFilterValue={setTenderFilesFilter}
            columnFilters={columnsFilter}
            setColumnFilters={setColumnFilters}
            rowsPerPage={10}
            resetTableDataOnChange={false}
          />
        </div>
      )}

      <div className="fl_view-category-container">
        <button
          disabled={upload.tenderStatus.toLowerCase() !== "succeeded"}
          onClick={() => navigate("/page/category")}
          className="btn"
        >
          View Category
        </button>
      </div>
    </div>
  );
};

export default FileContainer;

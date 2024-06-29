import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import styles from "../../../assets/css/LocationLayoutCategory.module.css";
import "../../../assets/css/globalStyles.css";
import { getErrorToast } from "../../../utils/useToast";
import {
  downloadDOCX,
  downloadPDF,
} from "../../../features/category/categorySlice";
import MarkdownRenderer from "../../common/MarkdownRenderer";

export default function LocationLayoutCategory() {
  const [showContentFlag, setShowContentFlag] = useState(false);
  const [showLocationFlag, setShowLocationFlag] = useState(false);
  // const [showBuildingWtpFlag, setShowBuildingWtpFlag] = useState(false);
  // const [showWaterTankFlag, setShowWaterTankFlag] = useState(false);
  const upload = useSelector((store) => store.upload);
  const category = useSelector((store) => store.category);
  const [isLoading, setIsLoading] = useState(false);

  const [layoutData, setLayoutData] = useState("");
  const [layoutDataId, setLayoutDataId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const dispatch = useDispatch();

  const handleToggleButtonClick = () => {
    setShowContentFlag(!showContentFlag);
  };

  useEffect(() => {
    getCategoryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getCategoryData = async () => {
    let data = new FormData();
    data.append("tender_number", upload.tenderNo);
    data.append("tender_name", upload.tenderName);
    data.append("category_name", "Location and Layout");
    let config = {
      method: "post",
      url: `${import.meta.env.VITE_BACKEND_URL}/dashboard/category-data/`,
      headers: {
        "content-type": "multipart/form-data",
      },
      data: data,
    };

    await axios(config)
      .then(function (response) {
        let data = response.data["category_output"];
        if (typeof data === "undefined") {
          return;
        }
        if ("Location and Layout" in data) {
          if ("Location_and_Layout" in data["Location and Layout"]) {
            setLayoutData(
              data["Location and Layout"]["Location_and_Layout"]["gpt_output"]
            );
            setLayoutDataId(
              data["Location and Layout"]["Location_and_Layout"]["_id"]
            );
          }
          setCategoryId(data["Location and Layout"]["category_output_id"]);
        }
        setIsLoading(!isLoading);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const downloadPdf = async (file_id, file_name) => {
    let data_pdf = new FormData();
    data_pdf.append("file_id", file_id);
    let config_pdf = {
      method: "post",
      url: `${import.meta.env.VITE_BACKEND_URL}/dashboard/download-category/`,
      headers: {
        "content-type": "multipart/form-data",
      },
      data: data_pdf,
      responseType: "blob",
    };
    await axios(config_pdf)
      .then(function (response) {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([response.data]));
        link.download = file_name + ".pdf";
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(link.href), 7000);
      })
      .catch(function (error) {
        console.log(error);
        if (error?.response?.status === 404)
          getErrorToast("The file couldnot be found on the server!", 10000);
        else
          getErrorToast(
            "Oops the file couldnot be downloaded, something went wrong!"
          );
      });
  };

  const downloadDocx = async (file_id, file_name) => {
    let data_docx = new FormData();
    data_docx.append("file_id", file_id);
    let config_docx = {
      method: "post",
      url: `${import.meta.env.VITE_BACKEND_URL}/dashboard/download-parameter/`,
      headers: {
        "content-type": "multipart/form-data",
      },
      data: data_docx,
      responseType: "blob",
    };
    await axios(config_docx)
      .then(function (response) {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([response.data]));
        link.download = file_name + ".docx";
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(link.href), 7000);
      })
      .catch(function (error) {
        console.log(error);
        if (error?.response?.status === 404)
          getErrorToast("The file couldnot be found on the server!", 10000);
        else
          getErrorToast(
            "Oops the file couldnot be downloaded, something went wrong!"
          );
      });
  };
  return (
    <div className={styles.LocationLayoutCategory_Container}>
      <div className={styles.LocationLayoutCategory_container_heading}>
        <h2>Location and Layout</h2>
        <button
          onClick={() => handleToggleButtonClick()}
          style={{ cursor: isLoading ? "pointer" : "progress" }}
        >
          {showContentFlag && isLoading ? "-" : "+"}
        </button>
      </div>
      {showContentFlag && isLoading ? (
        <div className={styles.LocationLayoutCategory_container_content}>
          <div
            className={
              styles.LocationLayoutCategory_container_content_location_container
            }
          >
            <div
              className={
                styles.LocationLayoutCategory_container_content_location_container_1_row
              }
            >
              <h3
                className={
                  styles.LocationLayoutCategory_container_content_location_container_heading
                }
              >
                Location and Layout
              </h3>
              <button
                className={
                  styles.LocationLayoutCategory_container_content_location_container_btn
                }
                onClick={() => {
                  setShowLocationFlag(!showLocationFlag);
                }}
              >
                {showLocationFlag ? "-" : "+"}
              </button>
            </div>
            {showLocationFlag ? (
              <div
                className={
                  styles.LocationLayoutCategory_container_content_location_container_2_row
                }
              >
                {/* <p>{layoutData}</p> */}
                <MarkdownRenderer content={layoutData} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: layoutDataId,
                        fileName: "Location and Layout",
                      })
                    );

                    // downloadDocx(layoutDataId, "Specification");
                  }}
                >
                  Download Location and Layout
                </button>
              </div>
            ) : (
              ""
            )}
          </div>

          <div
            className={
              styles.LocationLayoutCategory_container_content_downbtn_container
            }
          >
            <button
              className="category-download-btn"
              disabled={category.isLoading}
              onClick={() => {
                dispatch(
                  downloadPDF({
                    fileId: categoryId,
                    fileName: "LocationAndLayout",
                  })
                );

                // downloadPdf(categoryId, "LocationAndLayout");
              }}
            >
              Download Categorywise Extracted Tender
            </button>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import styles from "../../../assets/css/CableTrayCategory.module.css";
import "../../../assets/css/globalStyles.css";
import { getErrorToast } from "../../../utils/useToast";
import {
  downloadDOCX,
  downloadPDF,
} from "../../../features/category/categorySlice";
import MarkdownRenderer from "../../common/MarkdownRenderer";

export default function CableTrayCategory() {
  const [showContentFlag, setShowContentFlag] = useState(false);
  const [showSpecificationFlag, setShowSpecificationFlag] = useState(false);
  const upload = useSelector((store) => store.upload);
  const category = useSelector((store) => store.category);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const handleToggleButtonClick = () => {
    setShowContentFlag(!showContentFlag);
  };

  const [cableTrayData, setCableTrayData] = useState("");
  const [specificationId, setSpecificationId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  useEffect(() => {
    getCategoryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getCategoryData = async () => {
    let data = new FormData();
    data.append("tender_number", upload.tenderNo);
    data.append("tender_name", upload.tenderName);
    data.append("category_name", "Cable Tray");
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
        if ("Cable Tray" in data) {
          if ("cable_tray_specifications" in data["Cable Tray"]) {
            setCableTrayData(
              data["Cable Tray"]["cable_tray_specifications"]["gpt_output"]
            );
            setSpecificationId(
              data["Cable Tray"]["cable_tray_specifications"]["_id"]
            );
          }
          setCategoryId(data["Cable Tray"]["category_output_id"]);
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
    <div className={styles.CableTrayCategory_Container}>
      <div className={styles.CableTrayCategory_container_heading}>
        <h2>Cable Tray</h2>
        <button
          onClick={() => handleToggleButtonClick()}
          style={{ cursor: isLoading ? "pointer" : "progress" }}
        >
          {showContentFlag && isLoading ? "-" : "+"}
        </button>
      </div>

      {showContentFlag && isLoading ? (
        <div className={styles.CableTrayCategory_container_content}>
          <div
            className={
              styles.CableTrayCategory_container_content_specification_container
            }
          >
            <div
              className={
                styles.CableTrayCategory_container_content_specification_container_1_row
              }
            >
              <h3
                className={
                  styles.CableTrayCategory_container_content_specification_container_heading
                }
              >
                Cable Tray Specification
              </h3>
              <button
                className={
                  styles.CableTrayCategory_container_content_specification_container_btn
                }
                onClick={() => {
                  setShowSpecificationFlag(!showSpecificationFlag);
                }}
              >
                {showSpecificationFlag ? "-" : "+"}
              </button>
            </div>
            {showSpecificationFlag ? (
              <div
                className={
                  styles.CableTrayCategory_container_content_specification_container_2_row
                }
              >
                {/* <p>{cableTrayData}</p> */}
                <MarkdownRenderer content={cableTrayData} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: specificationId,
                        fileName: "Cable Tray Specification",
                      })
                    );

                    // downloadDocx(specificationId, "Specification");
                  }}
                >
                  Download Cable Tray Specification
                </button>
              </div>
            ) : (
              ""
            )}
          </div>

          <div
            className={
              styles.CableTrayCategory_container_content_downbtn_container
            }
          >
            <button
              className="category-download-btn"
              disabled={category.isLoading}
              onClick={() => {
                dispatch(
                  downloadPDF({
                    fileId: categoryId,
                    fileName: "CableTrayDetails",
                  })
                );

                // downloadPdf(categoryId, "CableTrayDetails");
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

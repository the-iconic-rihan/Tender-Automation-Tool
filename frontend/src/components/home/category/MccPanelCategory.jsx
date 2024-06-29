import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import styles from "../../../assets/css/MccPanelCategory.module.css";
import "../../../assets/css/globalStyles.css";
import { getErrorToast } from "../../../utils/useToast";
import {
  downloadDOCX,
  downloadPDF,
} from "../../../features/category/categorySlice";
import MarkdownRenderer from "../../common/MarkdownRenderer";
import SubCategory from "../../common/SubCategory";

export default function MccPanelCategory() {
  const [showContentFlag, setShowContentFlag] = useState(false);
  const [showSpecificationFlag, setShowSpecificationFlag] = useState(false);
  const upload = useSelector((store) => store.upload);
  const category = useSelector((store) => store.category);
  const [isLoading, setIsLoading] = useState(false);
  const handleToggleButtonClick = () => {
    setShowContentFlag(!showContentFlag);
  };
  const [mccPanelData, setMccPanelData] = useState("");
  const [specificationId, setSpecificationId] = useState("");
  const [plcPanel, setPlcPanel] = useState('');
  const [plcPanelId, setPlcPanelId] = useState('');
  const [categoryId, setCategoryId] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    getCategoryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getCategoryData = async () => {
    let data = new FormData();
    data.append("tender_number", upload.tenderNo);
    data.append("tender_name", upload.tenderName);
    data.append("category_name", "MCC Panel");
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

        console.log(data['MCC Panel']["plc_panel_specifications"]);


        if ("MCC Panel" in data) {
          console.log(`THIS RAN`);
          if ("mcc_panel_specifications" in data["MCC Panel"]) {
            setMccPanelData(
              data["MCC Panel"]["mcc_panel_specifications"]["gpt_output"]
            );
            setSpecificationId(
              data["MCC Panel"]["mcc_panel_specifications"]["_id"]
            );
          }

          if ("plc_panel_specifications" in data["MCC Panel"]) {
            setPlcPanel(data["MCC Panel"]["plc_panel_specifications"]["gpt_output"]);

            setPlcPanelId(data["MCC Panel"]["plc_panel_specifications"]["_id"]);
          }
          setCategoryId(data["MCC Panel"]["category_output_id"]);
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
    <div className={styles.MccPanelCategory_Container}>
      <div className={styles.MccPanelCategory_container_heading}>
        <h2>MCC Panel</h2>
        <button
          onClick={() => handleToggleButtonClick()}
          style={{ cursor: isLoading ? "pointer" : "progress" }}
        >
          {showContentFlag && isLoading ? "-" : "+"}
        </button>
      </div>

      {showContentFlag && isLoading ? (
        <div className={styles.MccPanelCategory_container_content}>
          <div
            className={
              styles.MccPanelCategory_container_content_specification_container
            }
          >
            <div
              className={
                styles.MccPanelCategory_container_content_specification_container_1_row
              }
            >
              <h3
                className={
                  styles.MccPanelCategory_container_content_specification_container_heading
                }
              >
                MCC Panel Specification
              </h3>
              <button
                className={
                  styles.MccPanelCategory_container_content_specification_container_btn
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
                  styles.MccPanelCategory_container_content_specification_container_2_row
                }
              >
                {/* <p>{mccPanelData}</p> */}
                <MarkdownRenderer content={mccPanelData} />

                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: specificationId,
                        fileName: "MCC Panel Specification",
                      })
                    );

                    // downloadDocx(specificationId, "Specification");
                  }}
                >
                  Download MCC Panel Specification
                </button>
              </div>
            ) : (
              ""
            )}
          </div>

          <SubCategory
            name={"PLC Panel"}
            data={plcPanel}
            id={plcPanelId}
          />

          <div
            className={
              styles.MccPanelCategory_container_content_downbtn_container
            }
          >
            <button
              className="category-download-btn"
              disabled={category.isLoading}
              onClick={() => {
                dispatch(
                  downloadPDF({
                    fileId: categoryId,
                    fileName: "MccPanelDetails",
                  })
                );

                // downloadPdf(categoryId, "MccPanelDetails");
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

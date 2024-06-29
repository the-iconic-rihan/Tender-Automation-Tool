import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import styles from "../../../assets/css/RawWaterCategory.module.css";
import "../../../assets/css/globalStyles.css";
import { getErrorToast } from "../../../utils/useToast";
import {
  downloadDOCX,
  downloadPDF,
} from "../../../features/category/categorySlice";
import MarkdownRenderer from "../../common/MarkdownRenderer";

export default function RawWaterCategory() {
  const [showContentFlag, setShowContentFlag] = useState(false);
  // const [showPumpFlag, setShowPumpFlag] = useState(false);
  const [showPumpTypeFlag, setShowPumpTypeFlag] = useState(false);
  // const [showMotorEfficiencyFlag, setShowMotorEfficiencyFlag] = useState(false);
  const upload = useSelector((store) => store.upload);
  const category = useSelector((store) => store.category);
  const [isLoading, setIsLoading] = useState(false);
  const handleToggleButtonClick = () => {
    setShowContentFlag(!showContentFlag);
  };

  const [pumpMoc, setPumpMoc] = useState("");
  // const [motorEfficiency, setMotorEfficiency] = useState("");
  const [pumpMocId, setPumpMocId] = useState("");
  // const [motorEfficiencyId, setMotorEfficiencyId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  // const [maxPump, setMaxPump] = useState("");
  // const [maxPumpId, setMaxPumpID] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    getCategoryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getCategoryData = async () => {
    let data = new FormData();
    data.append("tender_number", upload.tenderNo);
    data.append("tender_name", upload.tenderName);
    data.append("category_name", "Raw Water Tank");
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
        if ("Raw Water Tank" in data) {
          if ("position_moc_motor" in data["Raw Water Tank"]) {
            setPumpMoc(
              data["Raw Water Tank"]["position_moc_motor"]["gpt_output"]
            );
            setPumpMocId(data["Raw Water Tank"]["position_moc_motor"]["_id"]);
          }
          setCategoryId(data["Raw Water Tank"]["category_output_id"]);
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
    <div className={styles.RawWaterCategory_Container}>
      <div className={styles.RawWaterCategory_container_heading}>
        <h2>Raw water tank</h2>
        <button
          onClick={() => handleToggleButtonClick()}
          style={{ cursor: isLoading ? "pointer" : "progress" }}
        >
          {showContentFlag && isLoading ? "-" : "+"}
        </button>
      </div>
      {showContentFlag && isLoading ? (
        <div className={styles.RawWaterCategory_container_content}>
          <div
            className={
              styles.RawWaterCategory_container_content_pump_type_container
            }
          >
            <div
              className={
                styles.RawWaterCategory_container_content_pump_type_container_1_row
              }
            >
              <h3
                className={
                  styles.RawWaterCategory_container_content_pump_type_container_heading
                }
              >
                Raw Water Tank Specification
              </h3>
              <button
                className={
                  styles.RawWaterCategory_container_content_pump_type_container_btn
                }
                onClick={() => {
                  setShowPumpTypeFlag(!showPumpTypeFlag);
                }}
              >
                {showPumpTypeFlag ? "-" : "+"}
              </button>
            </div>
            {showPumpTypeFlag ? (
              <div
                className={
                  styles.RawWaterCategory_container_content_pump_type_container_2_row
                }
              >
                {/* <p>{pumpMoc}</p> */}
                <MarkdownRenderer content={pumpMoc} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: pumpMocId,
                        fileName: "Raw Water Tank Specification",
                      })
                    );

                    // downloadDocx(pumpMocId, "PumpType");
                  }}
                >
                  Download Raw Water Tank Specification
                </button>
              </div>
            ) : (
              ""
            )}
          </div>

          <div
            className={
              styles.RawWaterCategory_container_content_downbtn_container
            }
          >
            <button
              className="category-download-btn"
              disabled={category.isLoading}
              onClick={() => {
                dispatch(
                  downloadPDF({ fileId: categoryId, fileName: "RawWaterTank" })
                );

                // downloadPdf(categoryId, "RawWaterTank");
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

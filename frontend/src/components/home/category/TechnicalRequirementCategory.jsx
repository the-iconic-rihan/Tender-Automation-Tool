import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import styles from "../../../assets/css/TechnicalRequirementCategory.module.css";
import "../../../assets/css/globalStyles.css";
import { getErrorToast } from "../../../utils/useToast";
import {
  downloadDOCX,
  downloadPDF,
  downloadXLSX,
} from "../../../features/category/categorySlice";
import MarkdownRenderer from "../../common/MarkdownRenderer";
import SubCategory from "../../common/SubCategory";

export default function TechnicalRequirementCategory() {
  const [showContentFlag, setShowContentFlag] = useState(false);
  const [showIntelParameterFlag, setShowIntelParameterFlag] = useState(false);
  const [showWaterSourceFlag, setShowWaterSourceFlag] = useState(false);
  const [showWaterAnalysisFlag, setShowWaterAnalysisFlag] = useState(false);
  const upload = useSelector((store) => store.upload);
  const category = useSelector((store) => store.category);
  const [isLoading, setIsLoading] = useState(false);

  const [intelParameter, setIntelParameter] = useState("");
  const [waterSource, setWaterSource] = useState("");
  const [waterAnalysis, setWaterAnalysis] = useState("");
  const [intelParameterId, setIntelParameterId] = useState("");
  const [waterSourceId, setWaterSourceId] = useState("");
  const [waterAnalysisId, setWaterAnalysisId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [criticalParameter, setCriticalParameter] = useState("");
  const [criticalParameterId, setCriticalParameterId] = useState("");

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
    data.append("category_name", "Technical Requirements");
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
        if ("Technical Requirements" in data) {
          if ("Input parameters" in data["Technical Requirements"]) {
            setIntelParameter(
              data["Technical Requirements"]["Input parameters"]["gpt_output"]
            );
            setIntelParameterId(
              data["Technical Requirements"]["Input parameters"]["_id"]
            );
          }
          if ("source of water" in data["Technical Requirements"]) {
            setWaterSource(
              data["Technical Requirements"]["source of water"]["gpt_output"]
            );
            setWaterSourceId(
              data["Technical Requirements"]["source of water"]["_id"]
            );
          }
          if ("output parameter" in data["Technical Requirements"]) {
            setWaterAnalysis(
              data["Technical Requirements"]["output parameter"]["gpt_output"]
            );
            setWaterAnalysisId(
              data["Technical Requirements"]["output parameter"]["_id"]
            );
          }

          if ("Critical Parameters" in data["Technical Requirements"]) {
            const cp = data["Technical Requirements"]["Critical Parameters"];

            setCriticalParameter(cp["gpt_output"]);
            setCriticalParameterId(cp["_id"]);
          }

          setCategoryId(data["Technical Requirements"]["category_output_id"]);
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
    <div className={styles.TechnicalRequirementCategory_Container}>
      <div className={styles.TechnicalRequirementCategory_container_heading}>
        <h2>Technical Requirements</h2>
        <button
          onClick={() => handleToggleButtonClick()}
          style={{ cursor: isLoading ? "pointer" : "progress" }}
        >
          {showContentFlag && isLoading ? "-" : "+"}
        </button>
      </div>
      {showContentFlag && isLoading ? (
        <div className={styles.TechnicalRequirementCategory_container_content}>
          <div
            className={
              styles.TechnicalRequirementCategory_container_content_intel_parameter_container
            }
          >
            <div
              className={
                styles.TechnicalRequirementCategory_container_content_intel_parameter_container_1_row
              }
            >
              <h3
                className={
                  styles.TechnicalRequirementCategory_container_content_intel_parameter_container_heading
                }
              >
                Inlet Parameters
              </h3>
              <button
                className={
                  styles.TechnicalRequirementCategory_container_content_intel_parameter_container_btn
                }
                onClick={() => {
                  setShowIntelParameterFlag(!showIntelParameterFlag);
                }}
              >
                {showIntelParameterFlag ? "-" : "+"}
              </button>
            </div>
            {showIntelParameterFlag ? (
              <div
                className={
                  styles.TechnicalRequirementCategory_container_content_intel_parameter_container_2_row
                }
              >
                {/* <p>{intelParameter}</p> */}
                <MarkdownRenderer content={intelParameter} />
                <div className="sub-category-download-btn-container">
                  <button
                    className="sub-category-download-btn"
                    disabled={category.isLoading}
                    onClick={() => {
                      dispatch(
                        downloadDOCX({
                          fileId: intelParameterId,
                          fileName: "InletParameters",
                        })
                      );
                      // downloadDocx(intelParameterId, "InletParameters");
                    }}
                  >
                    Download Inlet Parameters (docx)
                  </button>

                  <button
                    className="sub-category-download-btn"
                    disabled={category.isLoading}
                    onClick={() =>
                      dispatch(
                        downloadXLSX({
                          fileId: intelParameterId,
                          fileName: "InletParameters",
                        })
                      )
                    }
                  >
                    Download Inlet Parameters (xlsx)
                  </button>
                </div>
              </div>
            ) : (
              ""
            )}
          </div>

          <div
            className={
              styles.TechnicalRequirementCategory_container_content_water_source_container
            }
          >
            <div
              className={
                styles.TechnicalRequirementCategory_container_content_water_source_container_1_row
              }
            >
              <h3
                className={
                  styles.TechnicalRequirementCategory_container_content_water_source_container_heading
                }
              >
                Source of Water
              </h3>
              <button
                className={
                  styles.TechnicalRequirementCategory_container_content_water_source_container_btn
                }
                onClick={() => {
                  setShowWaterSourceFlag(!showWaterSourceFlag);
                }}
              >
                {showWaterSourceFlag ? "-" : "+"}
              </button>
            </div>
            {showWaterSourceFlag ? (
              <div
                className={
                  styles.TechnicalRequirementCategory_container_content_water_source_container_2_row
                }
              >
                {/* <p>{waterSource}</p> */}
                <MarkdownRenderer content={waterSource} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: waterSourceId,
                        fileName: "SourceOfWater",
                      })
                    );

                    // downloadDocx(waterSourceId, "SourceOfWater");
                  }}
                >
                  Download Source of Water
                </button>
              </div>
            ) : (
              ""
            )}
          </div>

          <div
            className={
              styles.TechnicalRequirementCategory_container_content_water_analysis_container
            }
          >
            <div
              className={
                styles.TechnicalRequirementCategory_container_content_water_analysis_container_1_row
              }
            >
              <h3
                className={
                  styles.TechnicalRequirementCategory_container_content_water_analysis_container_heading
                }
              >
                Guaranteed Treated Water Analysis
              </h3>
              <button
                className={
                  styles.TechnicalRequirementCategory_container_content_water_analysis_container_btn
                }
                onClick={() => {
                  setShowWaterAnalysisFlag(!showWaterAnalysisFlag);
                }}
              >
                {showWaterAnalysisFlag ? "-" : "+"}
              </button>
            </div>
            {showWaterAnalysisFlag ? (
              <div
                className={
                  styles.TechnicalRequirementCategory_container_content_water_analysis_container_2_row
                }
              >
                {/* <p>{waterAnalysis}</p> */}
                <MarkdownRenderer content={waterAnalysis} />
                <div className="sub-category-download-btn-container">
                  <button
                    className="sub-category-download-btn"
                    disabled={category.isLoading}
                    onClick={() => {
                      dispatch(
                        downloadDOCX({
                          fileId: waterAnalysisId,
                          fileName: "WaterAnalysis",
                        })
                      );

                      // downloadDocx(waterAnalysisId, "WaterAnalysis");
                    }}
                  >
                    Download Guaranteed Treated Water Analysis (docx)
                  </button>

                  <button
                    className="sub-category-download-btn"
                    disabled={category.isLoading}
                    onClick={() =>
                      dispatch(
                        downloadXLSX({
                          fileId: waterAnalysisId,
                          fileName: "WaterAnalysis",
                        })
                      )
                    }
                  >
                    Download Guaranteed Treated Water Analysis (xlsx)
                  </button>
                </div>
              </div>
            ) : (
              ""
            )}
          </div>

          <SubCategory
            name={"Critical Parameters"}
            data={criticalParameter}
            id={criticalParameterId}
            isXlsxAv={true}
          />

          <div
            className={
              styles.TechnicalRequirementCategory_container_content_downbtn_container
            }
          >
            <button
              className="category-download-btn"
              disabled={category.isLoading}
              onClick={() => {
                dispatch(
                  downloadPDF({
                    fileId: categoryId,
                    fileName: "TechnicalRequirements",
                  })
                );
                // downloadPdf(categoryId, "TechnicalRequirements");
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

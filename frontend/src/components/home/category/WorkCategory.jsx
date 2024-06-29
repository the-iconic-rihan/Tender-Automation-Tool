/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import styles from "../../../assets/css/WorkCategory.module.css";
import "../../../assets/css/globalStyles.css";
import { getErrorToast } from "../../../utils/useToast";
import {
  downloadDOCX,
  downloadPDF,
  downloadXLSX,
} from "../../../features/category/categorySlice";

import MarkdownRenderer from "../../common/MarkdownRenderer";
import SubCategory from "../../common/SubCategory";

export default function WorkCategory() {
  const [showContentFlag, setShowContentFlag] = useState(false);
  const [showDesignFlag, setShowDesignFlag] = useState(false);
  const [showSupplyFlag, setShowSupplyFlag] = useState(false);
  const [showInstallationFlag, setShowInstallationFlag] = useState(false);
  const [showErectionFlag, setShowErectionFlag] = useState(false);
  const [showCommissioningFlag, setShowCommissioningFlag] = useState(false);
  const [showOnmFlag, setShowOnmFlag] = useState(false);
  const [showTrailRun, setShowTrailRun] = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  const [showPgTest, setShowPgTest] = useState(false);
  // const [showOS, setShowOS] = useState(false);
  const [showExclusions, setShowExclusions] = useState(false);
  const [showBatteryLimit, setShowBatteryLimit] = useState(false);
  const [operationalFlag, setOperationalFlag] = useState(false);
  const [terminalPointsFlag, setTerminalPointsFlag] = useState(false);
  const [requirementsFlag, setRequirementsFlag] = useState(false);

  // const [showRequirement, setShowRequirement] = useState(false);
  // const [showDrawing, setShowDrawing] = useState(false);
  const upload = useSelector((store) => store.upload);
  const category = useSelector((store) => store.category);
  const [isLoading, setIsLoading] = useState(false);

  const [design, setDesign] = useState("");
  const [supply, setSupply] = useState("");
  const [designId, setDesignId] = useState("");
  const [supplyId, setSupplyId] = useState("");
  const [installation, setInstallation] = useState("");
  const [installationId, setInstallationId] = useState("");
  // const [erection, setErection] = useState("");
  const [commissioning, setCommissioning] = useState("");
  const [commissioningId, setCommissioningId] = useState("");
  const [onm, setOnm] = useState("");
  const [trailRun, setTrailRun] = useState("");
  const [pgTest, setPgTest] = useState("");
  const [onmId, setOnmId] = useState("");
  const [trailRunId, setTrailRunId] = useState("");
  const [pgTestId, setPgTestId] = useState("");
  const [operational, setOperational] = useState("");
  const [operationalId, setOperationalId] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [batteryLimit, setBatteryLimit] = useState("");
  const [exclusionId, setExclusionsId] = useState("");
  const [batteryLimitId, setBatteryLimitId] = useState("");
  // const [requirements, setRequirements] = useState("");
  // const [Drawing, setDrawing] = useState("");
  const [training, setTraining] = useState("");
  const [trainingId, setTrainingId] = useState("");

  const [terminalPoints, setTerminalPoints] = useState("");
  const [terminalPointsId, setTerminalPointsId] = useState("");

  const [requirements, setRequirements] = useState("");
  const [requirementsId, setRequirementsId] = useState("");

  const [designCode, setDesignCode] = useState("");
  const [designCodeId, setDesignCodeId] = useState("");

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
    data.append("category_name", "Scope of Work");
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
        if ("Scope of Work" in data) {
          if ("SOW Design" in data["Scope of Work"]) {
            setDesign(data["Scope of Work"]["SOW Design"]["gpt_output"]);
            setDesignId(data["Scope of Work"]["SOW Design"]["_id"]);
          }
          if ("SOW Supply" in data["Scope of Work"]) {
            setSupply(data["Scope of Work"]["SOW Supply"]["gpt_output"]);
            setSupplyId(data["Scope of Work"]["SOW Supply"]["_id"]);
          }
          if ("SOW Installation" in data["Scope of Work"]) {
            setInstallation(
              data["Scope of Work"]["SOW Installation"]["gpt_output"]
            );
            setInstallationId(data["Scope of Work"]["SOW Installation"]["_id"]);
          }
          // if ("" in data["Scope of Work"]) {
          //   setErection(data["Scope of Work"][""]["gpt_output"]);
          // }
          if ("SOW Commissioning" in data["Scope of Work"]) {
            setCommissioning(
              data["Scope of Work"]["SOW Commissioning"]["gpt_output"]
            );
            setCommissioningId(
              data["Scope of Work"]["SOW Commissioning"]["_id"]
            );
          }
          if ("SOW O&M" in data["Scope of Work"]) {
            setOnm(data["Scope of Work"]["SOW O&M"]["gpt_output"]);
            setOnmId(data["Scope of Work"]["SOW O&M"]["_id"]);
          }
          if ("SOW TrialRunSpecs" in data["Scope of Work"]) {
            setTrailRun(
              data["Scope of Work"]["SOW TrialRunSpecs"]["gpt_output"]
            );
            setTrailRunId(data["Scope of Work"]["SOW TrialRunSpecs"]["_id"]);
          }
          if ("SOW TrainingReq" in data["Scope of Work"]) {
            setTraining(data["Scope of Work"]["SOW TrainingReq"]["gpt_output"]);
            setTrainingId(data["Scope of Work"]["SOW TrainingReq"]["_id"]);
          }
          if ("SOW PGTest" in data["Scope of Work"]) {
            setPgTest(data["Scope of Work"]["SOW PGTest"]["gpt_output"]);
            setPgTestId(data["Scope of Work"]["SOW PGTest"]["_id"]);
          }
          if ("SOW Operational Support" in data["Scope of Work"]) {
            setOperational(
              data["Scope of Work"]["SOW Operational Support"]["gpt_output"]
            );
            setOperationalId(
              data["Scope of Work"]["SOW Operational Support"]["_id"]
            );
          }
          if ("SOW Exclusion" in data["Scope of Work"]) {
            setExclusions(data["Scope of Work"]["SOW Exclusion"]["gpt_output"]);
            setExclusionsId(data["Scope of Work"]["SOW Exclusion"]["_id"]);
          }
          if ("SOW Battery Limits" in data["Scope of Work"]) {
            setBatteryLimit(
              data["Scope of Work"]["SOW Battery Limits"]["gpt_output"]
            );
            setBatteryLimitId(
              data["Scope of Work"]["SOW Battery Limits"]["_id"]
            );
          }

          if ("SOW TerminalPoints" in data["Scope of Work"]) {
            setTerminalPoints(
              data["Scope of Work"]["SOW TerminalPoints"]["gpt_output"]
            );
            setTerminalPointsId(
              data["Scope of Work"]["SOW TerminalPoints"]["_id"]
            );
          }

          if ("SOW SpecialRequirements" in data["Scope of Work"]) {
            setRequirements(
              data["Scope of Work"]["SOW SpecialRequirements"]["gpt_output"]
            );
            setRequirementsId(
              data["Scope of Work"]["SOW SpecialRequirements"]["_id"]
            );
          }

          if ("SOW DesignCodes" in data["Scope of Work"]) {
            setDesignCode(
              data["Scope of Work"]["SOW DesignCodes"]["gpt_output"]
            );

            setDesignCodeId(data["Scope of Work"]["SOW DesignCodes"]["_id"]);
          }

          // if ("" in data["Scope of Work"]) {
          //   setRequirements(data["Scope of Work"][""]["gpt_output"]);
          // }
          // if ("" in data["Scope of Work"]) {
          //   setDrawing(data["Scope of Work"][""]["gpt_output"]);
          // }
          setCategoryId(data["Scope of Work"]["category_output_id"]);
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
    <div className={styles.WorkCategory_container}>
      <div className={styles.WorkCategory_container_heading}>
        <h2>Scope of Work</h2>
        <button
          onClick={() => handleToggleButtonClick()}
          style={{ cursor: isLoading ? "pointer" : "progress" }}
        >
          {showContentFlag && isLoading ? "-" : "+"}
        </button>
      </div>
      {showContentFlag && isLoading ? (
        <div className={styles.WorkCategory_container_content}>
          <div
            className={styles.WorkCategory_container_content_design_container}
          >
            <div
              className={
                styles.WorkCategory_container_content_design_container_1_row
              }
            >
              <h3
                className={
                  styles.WorkCategory_container_content_design_container_heading
                }
              >
                Design
              </h3>
              <button
                className={
                  styles.WorkCategory_container_content_design_container_btn
                }
                onClick={() => {
                  setShowDesignFlag(!showDesignFlag);
                }}
              >
                {showDesignFlag ? "-" : "+"}
              </button>
            </div>
            {showDesignFlag ? (
              <div
                className={
                  styles.WorkCategory_container_content_design_container_2_row
                }
              >
                {/* <p>{design}</p> */}
                <MarkdownRenderer content={design} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: designId,
                        fileName: "Design",
                      })
                    );

                    // downloadDocx(designId, "Design");
                  }}
                >
                  Download SOW Design Information
                </button>
              </div>
            ) : (
              ""
            )}
          </div>

          <div
            className={styles.WorkCategory_container_content_supply_container}
          >
            <div
              className={
                styles.WorkCategory_container_content_supply_container_1_row
              }
            >
              <h3
                className={
                  styles.WorkCategory_container_content_supply_container_heading
                }
              >
                Supply
              </h3>
              <button
                className={
                  styles.WorkCategory_container_content_supply_container_btn
                }
                onClick={() => {
                  setShowSupplyFlag(!showSupplyFlag);
                }}
              >
                {showSupplyFlag ? "-" : "+"}
              </button>
            </div>
            {showSupplyFlag ? (
              <div
                className={
                  styles.WorkCategory_container_content_supply_container_2_row
                }
              >
                {/* <p>{supply}</p> */}
                <MarkdownRenderer content={supply} />
                <div className="sub-category-download-btn-container">
                  <button
                    className="sub-category-download-btn"
                    disabled={category.isLoading}
                    onClick={() => {
                      dispatch(
                        downloadDOCX({
                          fileId: supplyId,
                          fileName: "Supply",
                        })
                      );
                      // downloadDocx(supplyId, "Supply");
                    }}
                  >
                    Download SOW Supply (docx)
                  </button>
                  <button
                    className="sub-category-download-btn"
                    disabled={category.isLoading}
                    onClick={() =>
                      dispatch(
                        downloadXLSX({
                          fileId: supplyId,
                          fileName: "Supply",
                        })
                      )
                    }
                  >
                    Download SOW Exclusions (xlsx)
                  </button>
                </div>
              </div>
            ) : (
              ""
            )}
          </div>

          <div
            className={
              styles.WorkCategory_container_content_installation_container
            }
          >
            <div
              className={
                styles.WorkCategory_container_content_installation_container_1_row
              }
            >
              <h3
                className={
                  styles.WorkCategory_container_content_installation_container_heading
                }
              >
                Installation
              </h3>
              <button
                className={
                  styles.WorkCategory_container_content_installation_container_btn
                }
                onClick={() => {
                  setShowInstallationFlag(!showInstallationFlag);
                }}
              >
                {showInstallationFlag ? "-" : "+"}
              </button>
            </div>
            {showInstallationFlag ? (
              <div
                className={
                  styles.WorkCategory_container_content_installation_container_2_row
                }
              >
                {/* <p>{installation}</p> */}
                <MarkdownRenderer content={installation} />

                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: installationId,
                        fileName: "Installation",
                      })
                    );
                    // downloadDocx(installationId, "Installation");
                  }}
                >
                  Download SOW Installation
                </button>
              </div>
            ) : (
              ""
            )}
          </div>

          {/* <div
            className={styles.WorkCategory_container_content_erection_container}
          >
            <div
              className={
                styles.WorkCategory_container_content_erection_container_1_row
              }
            >
              <h3
                className={
                  styles.WorkCategory_container_content_erection_container_heading
                }
              >
                Erection
              </h3>
              <button
                className={
                  styles.WorkCategory_container_content_erection_container_btn
                }
                onClick={() => {
                  setShowErectionFlag(!showErectionFlag);
                }}
              >
                {showErectionFlag ? "-" : "+"}
              </button>
            </div>
            {showErectionFlag ? (
              <div
                className={
                  styles.WorkCategory_container_content_erection_container_2_row
                }
              >
                <p>{erection}</p>
                <button
                  className={
                    styles.WorkCategory_container_content_erection_container_2_row_btn
                  }
                >
                  Download SOW Erection
                </button>
              </div>
            ) : (
              ""
            )}
          </div> */}

          <div
            className={
              styles.WorkCategory_container_content_commissioning_container
            }
          >
            <div
              className={
                styles.WorkCategory_container_content_commissioning_container_1_row
              }
            >
              <h3
                className={
                  styles.WorkCategory_container_content_commissioning_container_heading
                }
              >
                Commissioning
              </h3>
              <button
                className={
                  styles.WorkCategory_container_content_commissioning_container_btn
                }
                onClick={() => {
                  setShowCommissioningFlag(!showCommissioningFlag);
                }}
              >
                {showCommissioningFlag ? "-" : "+"}
              </button>
            </div>
            {showCommissioningFlag ? (
              <div
                className={
                  styles.WorkCategory_container_content_commissioning_container_2_row
                }
              >
                {/* <p>{commissioning}</p>
                 */}
                <MarkdownRenderer content={commissioning} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: commissioningId,
                        fileName: "Commissioning",
                      })
                    );

                    // downloadDocx(commissioningId, "Commissioning");
                  }}
                >
                  Download SOW Commissioning
                </button>
              </div>
            ) : (
              ""
            )}
          </div>

          <div className={styles.WorkCategory_container_content_onm_container}>
            <div
              className={
                styles.WorkCategory_container_content_onm_container_1_row
              }
            >
              <h3
                className={
                  styles.WorkCategory_container_content_onm_container_heading
                }
              >
                O&M
              </h3>
              <button
                className={
                  styles.WorkCategory_container_content_onm_container_btn
                }
                onClick={() => {
                  setShowOnmFlag(!showOnmFlag);
                }}
              >
                {showOnmFlag ? "-" : "+"}
              </button>
            </div>
            {showOnmFlag ? (
              <div
                className={
                  styles.WorkCategory_container_content_onm_container_2_row
                }
              >
                {/* <p>{onm}</p> */}
                <MarkdownRenderer content={onm} />

                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: onmId,
                        fileName: "O&M",
                      })
                    );
                    // downloadDocx(onmId, "O&M");
                  }}
                >
                  Download SOW O&M
                </button>
              </div>
            ) : (
              ""
            )}
          </div>

          <div
            className={styles.WorkCategory_container_content_trialrun_container}
          >
            <div
              className={
                styles.WorkCategory_container_content_trialrun_container_1_row
              }
            >
              <h3
                className={
                  styles.WorkCategory_container_content_trialrun_container_heading
                }
              >
                Trial Run
              </h3>
              <button
                className={
                  styles.WorkCategory_container_content_trialrun_container_btn
                }
                onClick={() => {
                  setShowTrailRun(!showTrailRun);
                }}
              >
                {showTrailRun ? "-" : "+"}
              </button>
            </div>
            {showTrailRun ? (
              <div
                className={
                  styles.WorkCategory_container_content_trialrun_container_2_row
                }
              >
                {/* <p>{trailRun}</p> */}
                <MarkdownRenderer content={trailRun} />

                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: trailRunId,
                        fileName: "TrailRun",
                      })
                    );
                    // downloadDocx(trailRunId, "TrailRun");
                  }}
                >
                  Download SOW Trial Run
                </button>
              </div>
            ) : (
              ""
            )}
          </div>

          <div
            className={styles.WorkCategory_container_content_training_container}
          >
            <div
              className={
                styles.WorkCategory_container_content_training_container_1_row
              }
            >
              <h3
                className={
                  styles.WorkCategory_container_content_training_container_heading
                }
              >
                Training
              </h3>
              <button
                className={
                  styles.WorkCategory_container_content_training_container_btn
                }
                onClick={() => {
                  setShowTraining(!showTraining);
                }}
              >
                {showTraining ? "-" : "+"}
              </button>
            </div>
            {showTraining ? (
              <div
                className={
                  styles.WorkCategory_container_content_training_container_2_row
                }
              >
                {/* <p>{training}</p> */}
                <MarkdownRenderer content={training} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: trainingId,
                        fileName: "Training",
                      })
                    );

                    // downloadDocx(trainingId, "Training");
                  }}
                >
                  Download SOW Training
                </button>
              </div>
            ) : (
              ""
            )}
          </div>

          <div
            className={styles.WorkCategory_container_content_pgtest_container}
          >
            <div
              className={
                styles.WorkCategory_container_content_pgtest_container_1_row
              }
            >
              <h3
                className={
                  styles.WorkCategory_container_content_pgtest_container_heading
                }
              >
                PG Test
              </h3>
              <button
                className={
                  styles.WorkCategory_container_content_pgtest_container_btn
                }
                onClick={() => {
                  setShowPgTest(!showPgTest);
                }}
              >
                {showPgTest ? "-" : "+"}
              </button>
            </div>
            {showPgTest ? (
              <div
                className={
                  styles.WorkCategory_container_content_pgtest_container_2_row
                }
              >
                {/* <p>{pgTest}</p> */}
                <MarkdownRenderer content={pgTest} />

                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: pgTestId,
                        fileName: "PgTest",
                      })
                    );
                    // downloadDocx(pgTestId, "PgTest");
                  }}
                >
                  Download SOW PG Test
                </button>
              </div>
            ) : (
              ""
            )}
          </div>

          <div
            className={
              styles.WorkCategory_container_content_exclusion_container
            }
          >
            <div
              className={
                styles.WorkCategory_container_content_exclusion_container_1_row
              }
            >
              <h3
                className={
                  styles.WorkCategory_container_content_exclusion_container_heading
                }
              >
                Exclusions
              </h3>
              <button
                className={
                  styles.WorkCategory_container_content_exclusion_container_btn
                }
                onClick={() => {
                  setShowExclusions(!showExclusions);
                }}
              >
                {showExclusions ? "-" : "+"}
              </button>
            </div>
            {showExclusions ? (
              <div
                className={
                  styles.WorkCategory_container_content_exclusion_container_2_row
                }
              >
                {/* <p>{exclusions}</p> */}
                <MarkdownRenderer content={exclusions} />
                <div className="sub-category-download-btn-container">
                  <button
                    className="sub-category-download-btn"
                    disabled={category.isLoading}
                    onClick={() => {
                      dispatch(
                        downloadDOCX({
                          fileId: exclusionId,
                          fileName: "Exclusions",
                        })
                      );

                      // downloadDocx(exclusionId, "Exclusions");
                    }}
                  >
                    Download SOW Exclusions (docx)
                  </button>

                  <button
                    className="sub-category-download-btn"
                    disabled={category.isLoading}
                    onClick={() =>
                      dispatch(
                        downloadXLSX({
                          fileId: exclusionId,
                          fileName: "Exclusions",
                        })
                      )
                    }
                  >
                    Download SOW Exclusions (xlsx)
                  </button>
                </div>
              </div>
            ) : (
              ""
            )}
          </div>

          <div
            className={
              styles.WorkCategory_container_content_batterylimits_container
            }
          >
            <div
              className={
                styles.WorkCategory_container_content_batterylimits_container_1_row
              }
            >
              <h3
                className={
                  styles.WorkCategory_container_content_batterylimits_container_heading
                }
              >
                Battery Limits
              </h3>
              <button
                className={
                  styles.WorkCategory_container_content_batterylimits_container_btn
                }
                onClick={() => {
                  setShowBatteryLimit(!showBatteryLimit);
                }}
              >
                {showBatteryLimit ? "-" : "+"}
              </button>
            </div>
            {showBatteryLimit ? (
              <div
                className={
                  styles.WorkCategory_container_content_batterylimits_container_2_row
                }
              >
                {/* <p>{batteryLimit}</p> */}
                <MarkdownRenderer content={batteryLimit} />
                <div className="sub-category-download-btn-container">
                  <button
                    className="sub-category-download-btn"
                    disabled={category.isLoading}
                    onClick={() => {
                      dispatch(
                        downloadDOCX({
                          fileId: batteryLimitId,
                          fileName: "BatteryLimits",
                        })
                      );
                      // downloadDocx(batteryLimitId, "BatteryLimits");
                    }}
                  >
                    Download SOW Battery Limits (docx)
                  </button>
                  <button
                    className="sub-category-download-btn"
                    disabled={category.isLoading}
                    onClick={() =>
                      dispatch(
                        downloadXLSX({
                          fileId: batteryLimitId,
                          fileName: "BatteryLimits",
                        })
                      )
                    }
                  >
                    Download SOW Battery Limits (xlsx)
                  </button>
                </div>
              </div>
            ) : (
              ""
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Operational Support</h3>
              <button onClick={() => setOperationalFlag(!operationalFlag)}>
                {operationalFlag ? "-" : "+"}
              </button>
            </div>
            {operationalFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{operational}</p> */}
                <MarkdownRenderer content={operational} />

                <button
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: operationalId,
                        fileName: "Operational Support",
                      })
                    );
                  }}
                  className="sub-category-download-btn"
                >
                  Download SOW Operational Support
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Terminal Points</h3>
              <button
                onClick={() => setTerminalPointsFlag(!terminalPointsFlag)}
              >
                {terminalPointsFlag ? "-" : "+"}
              </button>
            </div>
            {terminalPointsFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{terminalPoints}</p> */}
                <MarkdownRenderer content={terminalPoints} />

                <div className="sub-category-download-btn-container">
                  <button
                    disabled={category.isLoading}
                    onClick={() => {
                      dispatch(
                        downloadDOCX({
                          fileId: terminalPointsId,
                          fileName: "Terminal Points",
                        })
                      );
                    }}
                    className="sub-category-download-btn"
                  >
                    Download SOW Terminal Points (docx)
                  </button>

                  <button
                    disabled={category.isLoading}
                    className="sub-category-download-btn"
                    onClick={() =>
                      dispatch(
                        downloadXLSX({
                          fileId: terminalPointsId,
                          fileName: "Terminal Points",
                        })
                      )
                    }
                  >
                    Download SOW Terminal Points (xlsx)
                  </button>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Special Requirements</h3>
              <button onClick={() => setRequirementsFlag(!requirementsFlag)}>
                {requirementsFlag ? "-" : "+"}
              </button>
            </div>
            {requirementsFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{requirements}</p> */}
                <MarkdownRenderer content={requirements} />

                <button
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: requirementsId,
                        fileName: "Special Requirements",
                      })
                    );
                  }}
                  className="sub-category-download-btn"
                >
                  Download SOW Special Requirements
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <SubCategory
            name={"Design Code"}
            data={designCode}
            id={designCodeId}
            isXlsxAv={true}
          />

          {/* <div
            className={
              styles.WorkCategory_container_content_specialrequirement_container
            }
          >
            <div
              className={
                styles.WorkCategory_container_content_specialrequirement_container_1_row
              }
            >
              <h3
                className={
                  styles.WorkCategory_container_content_specialrequirement_container_heading
                }
              >
                Other Special Requirements
              </h3>
              <button
                className={
                  styles.WorkCategory_container_content_specialrequirement_container_btn
                }
                onClick={() => {
                  setShowRequirement(!showRequirement);
                }}
              >
                {showRequirement ? "-" : "+"}
              </button>
            </div>
            {showRequirement ? (
              <div
                className={
                  styles.WorkCategory_container_content_specialrequirement_container_2_row
                }
              >
                <p>{requirements}</p>
                <button
                  className={
                    styles.WorkCategory_container_content_specialrequirement_container_2_row_btn
                  }
                >
                  Download SOW Special Requirements
                </button>
              </div>
            ) : (
              ""
            )}
          </div> */}

          {/* <div
            className={
              styles.WorkCategory_container_content_3ddrawing_container
            }
          >
            <div
              className={
                styles.WorkCategory_container_content_3ddrawing_container_1_row
              }
            >
              <h3
                className={
                  styles.WorkCategory_container_content_3ddrawing_container_heading
                }
              >
                3d drawing & special softwares
              </h3>
              <button
                className={
                  styles.WorkCategory_container_content_3ddrawing_container_btn
                }
                onClick={() => {
                  setShowDrawing(!showDrawing);
                }}
              >
                {showDrawing ? "-" : "+"}
              </button>
            </div>
            {showDrawing ? (
              <div
                className={
                  styles.WorkCategory_container_content_3ddrawing_container_2_row
                }
              >
                <p>{Drawing}</p>
                <button
                  className={
                    styles.WorkCategory_container_content_3ddrawing_container_2_row_btn
                  }
                >
                  Download SOW 3d drawing & special softwares
                </button>
              </div>
            ) : (
              ""
            )}
          </div> */}

          <div
            className={styles.WorkCategory_container_content_downbtn_container}
          >
            <button
              className="category-download-btn"
              disabled={category.isLoading}
              onClick={() => {
                dispatch(
                  downloadPDF({ fileId: categoryId, fileName: "ScopeofWork" })
                );
                // downloadPdf(categoryId, "ScopeofWork");
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

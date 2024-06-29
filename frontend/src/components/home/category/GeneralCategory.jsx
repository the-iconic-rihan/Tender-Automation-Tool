import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "../../../assets/css/GeneralCategory.module.css";
import "../../../assets/css/globalStyles.css";
import axios from "axios";
import { getErrorToast } from "../../../utils/useToast";
import {
  downloadDOCX,
  downloadPDF,
} from "../../../features/category/categorySlice";

import MarkdownRenderer from "../../common/MarkdownRenderer";

export default function GeneralCategory() {
  const [showContentFlag, setShowContentFlag] = useState(false);
  const [showLdClause, setShowLdClause] = useState(false);
  const [showProjectSchedule, setShowProjectSchedule] = useState(false);
  const [showProjectIntroduction, setShowProjectIntroduction] = useState(false);
  const [showOutputParameter, setShowOutputParameter] = useState(false);
  const [LdDate, setLdDate] = useState("");
  const [LdClause, setLdClause] = useState("");
  const [ProjectSchedule, setProjectSchedule] = useState("");
  const [ProjectIntroduction, setProjectIntroduction] = useState("");
  const [OutputParameter, setOutputParameter] = useState("");
  const [LdClauseId, setLdClauseId] = useState("");
  const [ProjectScheduleId, setProjectScheduleId] = useState("");
  const [ProjectIntroductionId, setProjectIntroductionId] = useState("");
  const [OutputParameterId, setOutputParameterId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // const category = useSelector((store) => store.category);
  const upload = useSelector((store) => store.upload);
  const category = useSelector((store) => store.category);

  const dispatch = useDispatch();

  useEffect(() => {
    getCategoryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getCategoryData = async () => {
    let data = new FormData();
    data.append("tender_name", upload.tenderName);
    data.append("tender_number", upload.tenderNo);
    data.append("category_name", "General T&C");
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
        if ("General T&C" in data) {
          if ("LD Date" in data["General T&C"]) {
            setLdDate(data["General T&C"]["LD Date"]["gpt_output"]);
          }
          if ("LD Clause" in data["General T&C"]) {
            setLdClause(data["General T&C"]["LD Clause"]["gpt_output"]);
            setLdClauseId(data["General T&C"]["LD Clause"]["_id"]);
          }
          if ("LDDate" in data["General T&C"]) {
            setLdDate(data["General T&C"]["LDDate"]["gpt_output"]);
          }
          if ("Project Timeline" in data["General T&C"]) {
            setProjectSchedule(
              data["General T&C"]["Project Timeline"]["gpt_output"]
            );
            setProjectScheduleId(
              data["General T&C"]["Project Timeline"]["_id"]
            );
          }
          if ("Project Introduction" in data["General T&C"]) {
            setProjectIntroduction(
              data["General T&C"]["Project Introduction"]["gpt_output"]
            );
            setProjectIntroductionId(
              data["General T&C"]["Project Introduction"]["_id"]
            );
          }
          if ("Output Parameters" in data["General T&C"]) {
            setOutputParameter(
              data["General T&C"]["Output Parameters"]["gpt_output"]
            );
            setOutputParameterId(
              data["General T&C"]["Output Parameters"]["_id"]
            );
          }
          setCategoryId(data["General T&C"]["category_output_id"]);
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

  const handleToggleButtonClick = () => {
    setShowContentFlag(!showContentFlag);
  };
  const handleToggleLdClause = () => {
    setShowLdClause(!showLdClause);
  };
  const handleToggleProjectSchedule = () => {
    setShowProjectSchedule(!showProjectSchedule);
  };
  const handleToggleProjectIntroduction = () => {
    setShowProjectIntroduction(!showProjectIntroduction);
  };
  const handleToggleOutputParameter = () => {
    setShowOutputParameter(!showOutputParameter);
  };

  return (
    <div className={styles.GeneralCategory_container}>
      <div className={styles.GeneralCategory_container_heading}>
        <h2>General terms and conditions</h2>
        <button
          onClick={() => handleToggleButtonClick()}
          style={{ cursor: isLoading ? "pointer" : "progress" }}
        >
          {showContentFlag && isLoading ? "-" : "+"}
        </button>
      </div>
      {showContentFlag && isLoading ? (
        <div className={styles.GeneralCategory_container_content}>
          <div
            className={
              styles.GeneralCategory_container_content_ld_date_container
            }
          >
            <h3
              className={
                styles.GeneralCategory_container_content_ld_date_container_heading
              }
            >
              LD Date
            </h3>
            <h3
              className={
                styles.GeneralCategory_container_content_ld_date_container_date
              }
            >
              LD Date
              <MarkdownRenderer content={LdDate} />
            </h3>
          </div>

          <div
            className={
              styles.GeneralCategory_container_content_ld_clause_container
            }
          >
            <div
              className={
                styles.GeneralCategory_container_content_ld_clause_container_1_row
              }
            >
              <h3
                className={
                  styles.GeneralCategory_container_content_ld_clause_container_heading
                }
              >
                LD Clause
              </h3>
              <button
                className={
                  styles.GeneralCategory_container_content_ld_clause_container_btn
                }
                onClick={() => handleToggleLdClause()}
              >
                {showLdClause ? "-" : "+"}
              </button>
            </div>
            {showLdClause ? (
              <div
                className={
                  styles.GeneralCategory_container_content_ld_clause_container_2_row
                }
              >
                {/* <p>{LdClause}</p> */}
                <MarkdownRenderer content={LdClause} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: LdClauseId,
                        fileName: "LdClause",
                      })
                    );
                  }}
                >
                  Download LD Clause
                </button>
              </div>
            ) : (
              ""
            )}
          </div>

          <div
            className={
              styles.GeneralCategory_container_content_project_schedule_container
            }
          >
            <div
              className={
                styles.GeneralCategory_container_content_project_schedule_container_1_row
              }
            >
              <h3
                className={
                  styles.GeneralCategory_container_content_project_schedule_container_heading
                }
              >
                Project Schedule
              </h3>
              <button
                className={
                  styles.GeneralCategory_container_content_project_schedule_container_btn
                }
                onClick={() => handleToggleProjectSchedule()}
              >
                {showProjectSchedule ? "-" : "+"}
              </button>
            </div>
            {showProjectSchedule ? (
              <div
                className={
                  styles.GeneralCategory_container_content_project_schedule_container_2_row
                }
              >
                {/* <p>{ProjectSchedule}</p> */}
                <MarkdownRenderer content={ProjectSchedule} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: ProjectScheduleId,
                        fileName: "Project Schedule",
                      })
                    );
                  }}
                >
                  Download Project Schedule
                </button>
              </div>
            ) : (
              ""
            )}
          </div>

          <div
            className={
              styles.GeneralCategory_container_content_project_intro_container
            }
          >
            <div
              className={
                styles.GeneralCategory_container_content_project_intro_container_1_row
              }
            >
              <h3
                className={
                  styles.GeneralCategory_container_content_project_intro_container_heading
                }
              >
                Project Introduction
              </h3>
              <button
                className={
                  styles.GeneralCategory_container_content_project_intro_container_btn
                }
                onClick={() => handleToggleProjectIntroduction()}
              >
                {showProjectIntroduction ? "-" : "+"}
              </button>
            </div>
            {showProjectIntroduction ? (
              <div
                className={
                  styles.GeneralCategory_container_content_project_intro_container_2_row
                }
              >
                {/* <p>{ProjectIntroduction}</p> */}
                <MarkdownRenderer content={ProjectIntroduction} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: ProjectIntroductionId,
                        fileName: "ProjectIntroduction",
                      })
                    );
                  }}
                >
                  Download Project Introduction
                </button>
              </div>
            ) : (
              ""
            )}
          </div>

          {/* <div
            className={
              styles.GeneralCategory_container_content_output_container
            }
          >
            <div
              className={
                styles.GeneralCategory_container_content_output_container_1_row
              }
            >
              <h3
                className={
                  styles.GeneralCategory_container_content_output_container_heading
                }
              >
                Output Parameter
              </h3>
              <button
                className={
                  styles.GeneralCategory_container_content_output_container_btn
                }
                onClick={() => handleToggleOutputParameter()}
              >
                {showOutputParameter ? "-" : "+"}
              </button>
            </div>
            {showOutputParameter ? (
              <div
                className={
                  styles.GeneralCategory_container_content_output_container_2_row
                }
              >
                <p>{OutputParameter}</p>
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: OutputParameterId,
                        fileName: "OutputParameter",
                      })
                    );
                  }}
                >
                  Download Output Parameter
                </button>
              </div>
            ) : (
              ""
            )}
          </div> */}

          <div
            className={
              styles.GeneralCategory_container_content_downbtn_container
            }
          >
            <button
              className="category-download-btn"
              disabled={category.isLoading}
              onClick={() => {
                dispatch(
                  downloadPDF({
                    fileId: categoryId,
                    fileName: "GeneralCategory",
                  })
                );
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

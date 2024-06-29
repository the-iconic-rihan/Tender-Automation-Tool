import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import styles from "../../../assets/css/PipingCategory.module.css";
import "../../../assets/css/globalStyles.css";
import { getErrorToast } from "../../../utils/useToast";
import {
  downloadDOCX,
  downloadPDF,
} from "../../../features/category/categorySlice";
import MarkdownRenderer from "../../common/MarkdownRenderer";

export default function PipingCategory() {
  const [showContentFlag, setShowContentFlag] = useState(false);
  const [showSpecificationFlag, setShowSpecificationFlag] = useState(false);
  const upload = useSelector((store) => store.upload);
  const category = useSelector((store) => store.category);
  const [isLoading, setIsLoading] = useState(false);
  const [lineDescFlag, setLineDescFlag] = useState(false);
  const [pipeSpecsFlag, setPipeSpecsFlag] = useState(false);
  const [supportFlag, setSupportFlag] = useState(false);

  const handleToggleButtonClick = () => {
    setShowContentFlag(!showContentFlag);
  };
  const [pipingData, setPipingData] = useState("");
  const [specificationId, setSpecificationId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [lineDesc, setLineDesc] = useState("");
  const [lineDescId, setLineDescId] = useState("");

  const [pipeSpcecs, setPipeSpecs] = useState("");
  const [pipeSpcecsId, setPipeSpecsId] = useState("");

  const [support, setSupport] = useState("");
  const [supportId, setSupportId] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    getCategoryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getCategoryData = async () => {
    let data = new FormData();
    data.append("tender_number", upload.tenderNo);
    data.append("tender_name", upload.tenderName);
    data.append("category_name", "Piping");
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
        if ("Piping" in data) {
          const piping = data["Piping"];

          if ("Line Description" in piping) {
            const lineD = piping["Line Description"];

            setLineDesc(lineD["gpt_output"]);
            setLineDescId(lineD["_id"]);
          }

          if ("Pipe Specifications" in piping) {
            const pipSpecs = piping["Pipe Specifications"];

            setPipeSpecs(pipSpecs["gpt_output"]);
            setPipeSpecsId(pipSpecs["_id"]);
          }

          if ("Support and Fitting" in piping) {
            const supp = piping["Support and Fitting"];

            setSupport(supp["gpt_output"]);
            setSupportId(supp["_id"]);
          }

          if ("piping_specifications" in data["Piping"]) {
            setPipingData(
              data["Piping"]["piping_specifications"]["gpt_output"]
            );
            setSpecificationId(data["Piping"]["piping_specifications"]["_id"]);
          }

          setCategoryId(data["Piping"]["category_output_id"]);
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
    <div className={styles.PipingCategory_Container}>
      <div className={styles.PipingCategory_container_heading}>
        <h2>Piping</h2>
        <button
          onClick={() => handleToggleButtonClick()}
          style={{ cursor: isLoading ? "pointer" : "progress" }}
        >
          {showContentFlag && isLoading ? "-" : "+"}
        </button>
      </div>

      {showContentFlag && isLoading ? (
        <div className={styles.PipingCategory_container_content}>
          {/* <div
            className={
              styles.PipingCategory_container_content_specification_container
            }
          >
            <div
              className={
                styles.PipingCategory_container_content_specification_container_1_row
              }
            >
              <h3
                className={
                  styles.PipingCategory_container_content_specification_container_heading
                }
              >
                Specification
              </h3>
              <button
                className={
                  styles.PipingCategory_container_content_specification_container_btn
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
                  styles.PipingCategory_container_content_specification_container_2_row
                }
              >
                <p>{pipingData}</p>
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: specificationId,
                        fileName: "Specification",
                      })
                    );

                    // downloadDocx(specificationId, "Specification");
                  }}
                >
                  Download Specification
                </button>
              </div>
            ) : (
              ""
            )}
          </div> */}

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Line Description</h3>
              <button onClick={() => setLineDescFlag(!lineDescFlag)}>
                {lineDescFlag ? "-" : "+"}
              </button>
            </div>
            {lineDescFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{lineDesc}</p> */}
                <MarkdownRenderer content={lineDesc} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: lineDescId,
                        fileName: "Line Description",
                      })
                    );
                  }}
                >
                  Download Line Description
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Pipe Specifications</h3>
              <button onClick={() => setPipeSpecsFlag(!pipeSpecsFlag)}>
                {pipeSpecsFlag ? "-" : "+"}
              </button>
            </div>
            {pipeSpecsFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{pipeSpcecs}</p> */}
                <MarkdownRenderer content={pipeSpcecs} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: pipeSpcecsId,
                        fileName: "Pipe Specifications",
                      })
                    );
                  }}
                >
                  Download Pipe Specifications
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Support and Fitting</h3>
              <button onClick={() => setSupportFlag(!supportFlag)}>
                {supportFlag ? "-" : "+"}
              </button>
            </div>
            {supportFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{support}</p> */}
                <MarkdownRenderer content={support} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: supportId,
                        fileName: "Support and Fitting",
                      })
                    );
                  }}
                >
                  Download Support and Fitting
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div
            className={
              styles.PipingCategory_container_content_downbtn_container
            }
          >
            <button
              className="category-download-btn"
              disabled={category.isLoading}
              onClick={() => {
                dispatch(
                  downloadPDF({ fileId: categoryId, fileName: "PipingDetails" })
                );

                // downloadPdf(categoryId, "PipingDetails");
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

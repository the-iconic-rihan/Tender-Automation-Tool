import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import styles from "../../../assets/css/PumpCategory.module.css";
import "../../../assets/css/globalStyles.css";
import { getErrorToast } from "../../../utils/useToast";
import {
  downloadDOCX,
  downloadPDF,
} from "../../../features/category/categorySlice";
import MarkdownRenderer from "../../common/MarkdownRenderer";
import SubCategory from "../../common/SubCategory";

export default function PumpCategory() {
  const [showContentFlag, setShowContentFlag] = useState(false);
  const [showSpecificationFlag, setShowSpecificationFlag] = useState(false);
  const [centrifugalPumpFlag, setCentrifugalPumpFlag] = useState(false);
  const [nonMetallicFlag, setNonMetallicaFlag] = useState(false);

  const upload = useSelector((store) => store.upload);
  const category = useSelector((store) => store.category);

  const [isLoading, setIsLoading] = useState(false);
  const handleToggleButtonClick = () => {
    setShowContentFlag(!showContentFlag);
  };

  const [sludgePump, setSludgePump] = useState("");
  const [sludgePumpId, setSludgePumpId] = useState("");

  const [centrifugalPump, setCentrifugalPump] = useState("");
  const [centrifugalPumpId, setCentrifugalPumpId] = useState("");

  const [nonMetallic, setNonMetallic] = useState("");
  const [nonMetallicId, setNonMetallicId] = useState("");

  const [pumpData, setPumpData] = useState("");
  const [specificationId, setSpecificationId] = useState("");
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
    data.append("category_name", "Pumps");
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

        console.log(response);

        if ("Pumps" in data) {
          const pumps = data["Pumps"];

          if ("Centrifugal Pumps" in pumps) {
            const cp = pumps["Centrifugal Pumps"];

            setCentrifugalPump(cp["gpt_output"]);
            setCentrifugalPumpId(cp["_id"]);
          }

          if ("Sludge Transfer Pumps" in pumps) {
            const slTPumps = pumps["Sludge Transfer Pumps"];

            setSludgePump(slTPumps["gpt_output"]);
            setSludgePumpId(slTPumps["_id"]);
          }

          if ("Non Mettalic" in pumps) {
            const nonMet = pumps["Non Mettalic"];

            setNonMetallic(nonMet["gpt_output"]);
            setNonMetallicId(nonMet["_id"]);
          }

          if ("pump moc vfd" in data["Pumps"]) {
            setPumpData(data["Pumps"]["pump moc vfd"]["gpt_output"]);
            setSpecificationId(data["Pumps"]["pump moc vfd"]["_id"]);
          }
          setCategoryId(data["Pumps"]["category_output_id"]);
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
    <div className={styles.PumpCategory_Container}>
      <div className={styles.PumpCategory_container_heading}>
        <h2>Pump</h2>
        <button
          onClick={() => handleToggleButtonClick()}
          style={{ cursor: isLoading ? "pointer" : "progress" }}
        >
          {showContentFlag && isLoading ? "-" : "+"}
        </button>
      </div>

      {showContentFlag && isLoading ? (
        <div className={styles.PumpCategory_container_content}>
          {/* <div
            className={
              styles.PumpCategory_container_content_specification_container
            }
          >
            <div
              className={
                styles.PumpCategory_container_content_specification_container_1_row
              }
            >
              <h3
                className={
                  styles.PumpCategory_container_content_specification_container_heading
                }
              >
                Pumps Specification
              </h3>
              <button
                className={
                  styles.PumpCategory_container_content_specification_container_btn
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
                  styles.PumpCategory_container_content_specification_container_2_row
                }
              >
                <MarkdownRenderer content={pumpData} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: specificationId,
                        fileName: "Pumps Specification",
                      })
                    );

                    // downloadDocx(specificationId, "Specification");
                  }}
                >
                  Download Pumps Specification
                </button>
              </div>
            ) : (
              ""
            )}
          </div> */}

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Centrifugal Pump</h3>
              <button
                onClick={() => setCentrifugalPumpFlag(!centrifugalPumpFlag)}
              >
                {centrifugalPumpFlag ? "-" : "+"}
              </button>
            </div>
            {centrifugalPumpFlag ? (
              <div className="sub_category-content-container">
                <MarkdownRenderer content={centrifugalPump} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: centrifugalPumpId,
                        fileName: "Centrifugal Pump",
                      })
                    );
                  }}
                >
                  Download Centrifugal Pump
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <SubCategory
            name="Sludge Transfer Pumps"
            data={sludgePump}
            id={sludgePumpId}
          />

          {/* <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Non Metallic</h3>
              <button onClick={() => setNonMetallicaFlag(!nonMetallicFlag)}>
                {nonMetallicFlag ? "-" : "+"}
              </button>
            </div>
            {nonMetallicFlag ? (
              <div className="sub_category-content-container">
                <MarkdownRenderer content={nonMetallic} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: nonMetallicId,
                        fileName: "Non Metallic",
                      })
                    );
                  }}
                >
                  Download Non Metallic
                </button>
              </div>
            ) : (
              <></>
            )}
          </div> */}

          <div
            className={styles.PumpCategory_container_content_downbtn_container}
          >
            <button
              className="category-download-btn"
              disabled={category.isLoading}
              onClick={() => {
                dispatch(
                  downloadPDF({ fileId: categoryId, fileName: "PumpDetails" })
                );

                // downloadPdf(categoryId, "PumpDetails");
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

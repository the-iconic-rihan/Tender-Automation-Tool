import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import styles from "../../../assets/css/CableCategory.module.css";
import "../../../assets/css/globalStyles.css";
import { getErrorToast } from "../../../utils/useToast";
import {
  downloadDOCX,
  downloadPDF,
} from "../../../features/category/categorySlice";
import MarkdownRenderer from "../../common/MarkdownRenderer";

export default function CableCategory() {
  const [showContentFlag, setShowContentFlag] = useState(false);
  const [showSpecificationFlag, setShowSpecificationFlag] = useState(false);
  const [powerCableFlag, setPowerCableFlag] = useState(false);
  const [controlCableFlag, setControlCableFlag] = useState(false);
  const [instrCableFlag, setInstrCableFlag] = useState(false);

  const upload = useSelector((store) => store.upload);
  const category = useSelector((store) => store.category);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const handleToggleButtonClick = () => {
    setShowContentFlag(!showContentFlag);
  };

  const [powerCable, setPowerCable] = useState("");
  const [powerCableId, setPowerCableId] = useState("");

  const [controlCable, setControlCable] = useState("");
  const [controlCableId, setControlCableId] = useState("");

  const [instrCable, setInstrCable] = useState("");
  const [instrCableId, setInstrCableId] = useState("");

  const [CableData, setCableData] = useState("");
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
    data.append("category_name", "Cable");
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
        if ("Cable" in data) {
          const cable = data["Cable"];

          // if ("Control Cables" in cable) {
          //   const ctrl = cable["Control Cables"];

          //   setControlCable(ctrl["gpt_output"]);
          //   setControlCableId(ctrl["_id"]);
          // }

          if ("Instrumentation and Control Cables" in cable) {
            const instr = cable["Instrumentation and Control Cables"];

            setInstrCable(instr["gpt_output"]);
            setInstrCableId(instr["_id"]);
          }

          if ("Power Cables" in cable) {
            const pwr = cable["Power Cables"];

            setPowerCable(pwr["gpt_output"]);
            setPowerCableId(pwr["_id"]);
          }

          if ("cable specifications" in data["Cable"]) {
            setCableData(data["Cable"]["cable specifications"]["gpt_output"]);
            setSpecificationId(data["Cable"]["cable specifications"]["_id"]);
          }
          setCategoryId(data["Cable"]["category_output_id"]);
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
    <div className={styles.CableCategory_Container}>
      <div className={styles.CableCategory_container_heading}>
        <h2>Cable</h2>
        <button
          onClick={() => handleToggleButtonClick()}
          style={{ cursor: isLoading ? "pointer" : "progress" }}
        >
          {showContentFlag && isLoading ? "-" : "+"}
        </button>
      </div>

      {showContentFlag && isLoading ? (
        <div className={styles.CableCategory_container_content}>
          {/* <div
            className={
              styles.CableCategory_container_content_specification_container
            }
          >
            <div
              className={
                styles.CableCategory_container_content_specification_container_1_row
              }
            >
              <h3
                className={
                  styles.CableCategory_container_content_specification_container_heading
                }
              >
                Specification
              </h3>
              <button
                className={
                  styles.CableCategory_container_content_specification_container_btn
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
                  styles.CableCategory_container_content_specification_container_2_row
                }
              >
                <p>{CableData}</p>
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

          {/* <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Control Cables</h3>
              <button onClick={() => setControlCableFlag(!controlCableFlag)}>
                {controlCableFlag ? "-" : "+"}
              </button>
            </div>
            {controlCableFlag ? (
              <div className="sub_category-content-container">
                <p>{controlCable}</p>
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: controlCableId,
                        fileName: "Control Cables",
                      })
                    );
                  }}
                >
                  Download Control Cables
                </button>
              </div>
            ) : (
              <></>
            )}
          </div> */}

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Instrumentation and Control Cables</h3>
              <button onClick={() => setInstrCableFlag(!instrCableFlag)}>
                {instrCableFlag ? "-" : "+"}
              </button>
            </div>
            {instrCableFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{instrCable}</p> */}
                <MarkdownRenderer content={instrCable} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: instrCableId,
                        fileName: "Instrumentation and Control Cables",
                      })
                    );
                  }}
                >
                  Download Instrumentation and Control Cables
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Power Cables</h3>
              <button onClick={() => setPowerCableFlag(!powerCableFlag)}>
                {powerCableFlag ? "-" : "+"}
              </button>
            </div>
            {powerCableFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{powerCable}</p> */}
                <MarkdownRenderer content={powerCable} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: powerCableId,
                        fileName: "Power Cables",
                      })
                    );
                  }}
                >
                  Download Power Cables
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div
            className={styles.CableCategory_container_content_downbtn_container}
          >
            <button
              className="category-download-btn"
              disabled={category.isLoading}
              onClick={() => {
                dispatch(
                  downloadPDF({ fileId: categoryId, fileName: "CableDetails" })
                );

                // downloadPdf(categoryId, "CableDetails");
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

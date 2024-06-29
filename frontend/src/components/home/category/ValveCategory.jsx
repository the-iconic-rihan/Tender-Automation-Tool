import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import styles from "../../../assets/css/ValveCategory.module.css";
import "../../../assets/css/globalStyles.css";
import { getErrorToast } from "../../../utils/useToast";
import {
  downloadDOCX,
  downloadPDF,
} from "../../../features/category/categorySlice";
import MarkdownRenderer from "../../common/MarkdownRenderer";

export default function ValveCategory() {
  const [showContentFlag, setShowContentFlag] = useState(false);
  const [showSpecificationFlag, setShowSpecificationFlag] = useState(false);

  const [butterflyValveFlag, setButterflyValveFlag] = useState(false);
  const [diaphragmValveFlag, setDiaphragmValveFlag] = useState(false);
  const [ballValveFlag, setBallValveFlag] = useState(false);
  const [globeValveFlag, setGlobeValveFlag] = useState(false);
  const [gateValveFlag, setGateValveFlag] = useState(false);
  const [checkValveFlag, setCheckValveFlag] = useState(false);
  const [otherValveFlag, setOtherValveFlag] = useState(false);

  const [butterflyValve, setButterflyValve] = useState("");
  const [butterflyValveId, setButterflyValveId] = useState("");

  const [diaphragmValve, setDiaphragmValve] = useState("");
  const [diaphragmValveId, setDiaphragmValveId] = useState("");

  const [ballValve, setBallValve] = useState("");
  const [ballValveId, setBallValveId] = useState("");

  const [globeValve, setGlobeValve] = useState("");
  const [globeValveId, setGlobeValveId] = useState("");

  const [gateValve, setGateValve] = useState("");
  const [gateValveId, setGateValveId] = useState("");

  const [checkValve, setcheckValve] = useState("");
  const [checkValveId, setcheckValveId] = useState("");

  const [otherValve, setOtherValve] = useState("");
  const [otherValveId, setOtherValveId] = useState("");

  const upload = useSelector((store) => store.upload);
  const category = useSelector((store) => store.category);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleButtonClick = () => {
    setShowContentFlag(!showContentFlag);
  };

  const [valveData, setValveData] = useState("");
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
    data.append("category_name", "Valves");
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

        if ("Valves" in data) {
          const valves = data["Valves"];

          if ("Butterfly Valve" in valves) {
            const butterflyV = valves["Butterfly Valve"];

            setButterflyValve(butterflyV["gpt_output"]);
            setButterflyValveId(butterflyV["_id"]);
          }

          if ("Diaphragm Valve" in valves) {
            const diaphV = valves["Diaphragm Valve"];

            setDiaphragmValve(diaphV["gpt_output"]);
            setDiaphragmValveId(diaphV["_id"]);
          }

          if ("Ball Valve" in valves) {
            const ballV = valves["Ball Valve"];

            setBallValve(ballV["gpt_output"]);
            setBallValveId(ballV["_id"]);
          }

          if ("Globe Valve" in valves) {
            const globeV = valves["Globe Valve"];

            setGlobeValve(globeV["gpt_output"]);
            setGlobeValveId(globeV["_id"]);
          }

          if ("Gate Valve" in valves) {
            const gateV = valves["Gate Valve"];

            setGateValve(gateV["gpt_output"]);
            setGateValveId(gateV["_id"]);
          }

          if ("Check Valve" in valves) {
            const checkV = valves["Check Valve"];

            setcheckValve(checkV["gpt_output"]);
            setcheckValveId(checkV["_id"]);
          }

          if ("Other Valves" in valves) {
            const othersV = valves["Other Valves"];

            setOtherValve(othersV["gpt_output"]);
            setOtherValveId(othersV["_id"]);
          }

          if ("valve_specifications" in data["Valves"]) {
            setValveData(data["Valves"]["valve_specifications"]["gpt_output"]);
            setSpecificationId(data["Valves"]["valve_specifications"]["_id"]);
          }
          setCategoryId(data["Valves"]["category_output_id"]);
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
    <div className={styles.ValveCategory_Container}>
      <div className={styles.ValveCategory_container_heading}>
        <h2>Valve</h2>
        <button
          onClick={() => handleToggleButtonClick()}
          style={{ cursor: isLoading ? "pointer" : "progress" }}
        >
          {showContentFlag && isLoading ? "-" : "+"}
        </button>
      </div>

      {showContentFlag && isLoading ? (
        <div className={styles.ValveCategory_container_content}>
          {/* <div
            className={
              styles.ValveCategory_container_content_specification_container
            }
          >
            <div
              className={
                styles.ValveCategory_container_content_specification_container_1_row
              }
            >
              <h3
                className={
                  styles.ValveCategory_container_content_specification_container_heading
                }
              >
                Specification
              </h3>
              <button
                className={
                  styles.ValveCategory_container_content_specification_container_btn
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
                  styles.ValveCategory_container_content_specification_container_2_row
                }
              >
                <p>{valveData}</p>
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
              <h3>Butterfly Valve</h3>
              <button
                onClick={() => setButterflyValveFlag(!butterflyValveFlag)}
              >
                {butterflyValveFlag ? "-" : "+"}
              </button>
            </div>
            {butterflyValveFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{butterflyValve}</p> */}
                <MarkdownRenderer content={butterflyValve} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: butterflyValveId,
                        fileName: "Butterfly Valve",
                      })
                    );
                  }}
                >
                  Download Butterfly Valve
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Diaphragm Valve</h3>
              <button
                onClick={() => setDiaphragmValveFlag(!diaphragmValveFlag)}
              >
                {diaphragmValveFlag ? "-" : "+"}
              </button>
            </div>
            {diaphragmValveFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{diaphragmValve}</p> */}
                <MarkdownRenderer content={diaphragmValve} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: diaphragmValveId,
                        fileName: "Diaphragm Valve",
                      })
                    );
                  }}
                >
                  Download Diaphragm Valve
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Ball Valve</h3>
              <button onClick={() => setBallValveFlag(!ballValveFlag)}>
                {ballValveFlag ? "-" : "+"}
              </button>
            </div>
            {ballValveFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{ballValve}</p> */}
                <MarkdownRenderer content={ballValve} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: ballValveId,
                        fileName: "Ball Valve",
                      })
                    );
                  }}
                >
                  Download Ball Valve
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Globe Valve</h3>
              <button onClick={() => setGlobeValveFlag(!globeValveFlag)}>
                {globeValveFlag ? "-" : "+"}
              </button>
            </div>
            {globeValveFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{globeValve}</p> */}
                <MarkdownRenderer content={globeValve} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: globeValveId,
                        fileName: "Globe Valve",
                      })
                    );
                  }}
                >
                  Download Globe Valve
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Gate Valve</h3>
              <button onClick={() => setGateValveFlag(!gateValveFlag)}>
                {gateValveFlag ? "-" : "+"}
              </button>
            </div>
            {gateValveFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{gateValve}</p> */}
                <MarkdownRenderer content={gateValve} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: gateValveId,
                        fileName: "Gate Valve",
                      })
                    );
                  }}
                >
                  Download Gate Valve
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Check Valve</h3>
              <button onClick={() => setCheckValveFlag(!checkValveFlag)}>
                {checkValveFlag ? "-" : "+"}
              </button>
            </div>
            {checkValveFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{checkValve}</p> */}
                <MarkdownRenderer content={checkValve} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: checkValveId,
                        fileName: "Check Valve",
                      })
                    );
                  }}
                >
                  Download Check Valve
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Other Valve</h3>
              <button onClick={() => setOtherValveFlag(!otherValveFlag)}>
                {otherValveFlag ? "-" : "+"}
              </button>
            </div>
            {otherValveFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{otherValve}</p> */}
                <MarkdownRenderer content={otherValve} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: otherValveId,
                        fileName: "Other Valve",
                      })
                    );
                  }}
                >
                  Download Other Valve
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div
            className={styles.ValveCategory_container_content_downbtn_container}
          >
            <button
              className="category-download-btn"
              disabled={category.isLoading}
              onClick={() => {
                dispatch(
                  downloadPDF({ fileId: categoryId, fileName: "ValveDetails" })
                );

                // downloadPdf(categoryId, "ValveDetails");
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

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import styles from "../../../assets/css/ChemicalDosingCategory.module.css";
import "../../../assets/css/globalStyles.css";
import { getErrorToast } from "../../../utils/useToast";
import {
  downloadDOCX,
  downloadPDF,
  downloadXLSX,
} from "../../../features/category/categorySlice";
import MarkdownRenderer from "../../common/MarkdownRenderer";

export default function ChemicalDosingCategory() {
  const [showContentFlag, setShowContentFlag] = useState(false);
  const [showFeSo4Flag, setShowFeSo4Flag] = useState(false);
  const [chemicalTankFlag, setChemicalTankFlag] = useState(false);
  const [pumpsQuantityFlag, setPumpsQuantityFlag] = useState(false);
  const [pumpsSpecificationFlag, setPumpsSpecificationFlag] = useState(false);
  const [dosingQuantityFlag, setDosingQuantityFlag] = useState(false);
  const [phCorrectionFlag, setPhCorrectionFlag] = useState(false);
  const [autoHandlingSystemFlag, setAutoHandlingSystemFlag] = useState(false);

  // const [showLimeFlag, setShowLimeFlag] = useState(false);
  // const [showHypoCalFlag, setShowHypoCalFlag] = useState(false);
  // const [showNaClFlag, setShowNaClFlag] = useState(false);

  const [chemicalTank, setChemicalTank] = useState("");
  const [chemicalTankId, setChemicalTankId] = useState("");

  const [pumpsQuantity, setPumpsQuantity] = useState("");
  const [pumpsQuantityId, setPumpsQuantityId] = useState("");

  const [pumpsSpecification, setPumpsSpecification] = useState("");
  const [pumpsSpecificationId, setPumpsSpecificationId] = useState("");

  const [dosingQuantity, setDosingQuantity] = useState("");
  const [dosingQuantityId, setDosingQuantityId] = useState("");

  const [phCorrection, setPhCorrection] = useState("");
  const [phCorrectionId, setPhCorrectionId] = useState("");

  const [autoHandlingSystem, setAutoHandlingSystem] = useState("");
  const [autoHandlingSystemId, setAutoHandlingSystemId] = useState("");

  const handleToggleButtonClick = () => {
    setShowContentFlag(!showContentFlag);
  };

  const upload = useSelector((store) => store.upload);
  const category = useSelector((store) => store.category);
  const [isLoading, setIsLoading] = useState(false);
  const [CategoryData, setCategoryData] = useState("");
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
    data.append("category_name", "Chemical Dosing System");
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
        if ("Chemical Dosing System" in data) {
          const system = data["Chemical Dosing System"];

          if ("Chemical Dosing Tank" in system) {
            const tank = system["Chemical Dosing Tank"];

            setChemicalTank(tank["gpt_output"]);
            setChemicalTankId(tank["_id"]);
          }

          if ("Quantity of Dosing Pumps" in system) {
            const pQuan = system["Quantity of Dosing Pumps"];

            setPumpsQuantity(pQuan["gpt_output"]);
            setPumpsQuantityId(pQuan["_id"]);
          }

          if ("Specifications of Dosing Pumps" in system) {
            const pSpecs = system["Specifications of Dosing Pumps"];

            setPumpsSpecification(pSpecs["gpt_output"]);
            setPumpsSpecificationId(pSpecs["_id"]);
          }

          if ("Dosing Quantity" in system) {
            const dosingQ = system["Dosing Quantity"];

            setDosingQuantity(dosingQ["gpt_output"]);
            setDosingQuantityId(dosingQ["_id"]);
          }

          if ("pH Correction or Boosting System" in system) {
            const pHCorr = system["pH Correction or Boosting System"];

            setPhCorrection(pHCorr["gpt_output"]);
            setPhCorrectionId(pHCorr["_id"]);
          }

          if ("Auto Handling System" in system) {
            const autoHand = system["Auto Handling System"];

            setAutoHandlingSystem(autoHand["gpt_output"]);
            setAutoHandlingSystemId(autoHand["_id"]);
          }

          if ("chemical_dosing_system" in data["Chemical Dosing System"]) {
            setCategoryData(
              data["Chemical Dosing System"]["chemical_dosing_system"][
              "gpt_output"
              ]
            );
            setSpecificationId(
              data["Chemical Dosing System"]["chemical_dosing_system"]["_id"]
            );
          }
          setCategoryId(data["Chemical Dosing System"]["category_output_id"]);
        }
        setIsLoading(!isLoading);
      })
      .catch(function (error) {
        console.log(error);
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
  return (
    <div className={styles.ChemicalDosingCategory_Container}>
      <div className={styles.ChemicalDosingCategory_container_heading}>
        <h2>Chemical Dosing System</h2>
        <button
          onClick={() => handleToggleButtonClick()}
          style={{ cursor: isLoading ? "pointer" : "progress" }}
        >
          {showContentFlag && isLoading ? "-" : "+"}
        </button>
      </div>
      {showContentFlag && isLoading ? (
        <div className={styles.ChemicalDosingCategory_container_content}>
          {/* <div
            className={
              styles.ChemicalDosingCategory_container_content_FeSo4_container
            }
          >
            <div
              className={
                styles.ChemicalDosingCategory_container_content_FeSo4_container_1_row
              }
            >
              <h3
                className={
                  styles.ChemicalDosingCategory_container_content_FeSo4_container_heading
                }
              >
                Specification
              </h3>
              <button
                className={
                  styles.ChemicalDosingCategory_container_content_FeSo4_container_btn
                }
                onClick={() => {
                  setShowFeSo4Flag(!showFeSo4Flag);
                }}
              >
                {showFeSo4Flag ? "-" : "+"}
              </button>
            </div>
            {showFeSo4Flag ? (
              <div
                className={
                  styles.ChemicalDosingCategory_container_content_FeSo4_container_2_row
                }
              >
                <p>{CategoryData}</p>
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
              <h3>Chemical Dosing Tank</h3>
              <button onClick={() => setChemicalTankFlag(!chemicalTankFlag)}>
                {chemicalTankFlag ? "-" : "+"}
              </button>
            </div>
            {chemicalTankFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{chemicalTank}</p> */}
                <MarkdownRenderer content={chemicalTank} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: chemicalTankId,
                        fileName: "Chemical Dosing Tank",
                      })
                    );
                  }}
                >
                  Download Chemical Dosing Tank
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Quantity of Dosing Pumps</h3>
              <button onClick={() => setPumpsQuantityFlag(!pumpsQuantityFlag)}>
                {pumpsQuantityFlag ? "-" : "+"}
              </button>
            </div>
            {pumpsQuantityFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{pumpsQuantity}</p> */}
                <MarkdownRenderer content={pumpsQuantity} />
                <div className="sub-category-download-btn-container">
                  <button
                    className="sub-category-download-btn"
                    disabled={category.isLoading}
                    onClick={() => {
                      dispatch(
                        downloadDOCX({
                          fileId: pumpsQuantityId,
                          fileName: "Quantity of Dosing Pumps",
                        })
                      );
                    }}
                  >
                    Download Quantity of Dosing Pumps (docx)
                  </button>
                  <button
                    className="sub-category-download-btn"
                    disabled={category.isLoading}
                    onClick={() =>
                      dispatch(
                        downloadXLSX({
                          fileId: pumpsQuantityId,
                          fileName: "Quantity of Dosing Pumps",
                        })
                      )
                    }
                  >
                    Download  Quantity of Dosing Pumps (xlsx)
                  </button>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Dosing Pumps Specification</h3>
              <button
                onClick={() =>
                  setPumpsSpecificationFlag(!pumpsSpecificationFlag)
                }
              >
                {pumpsSpecificationFlag ? "-" : "+"}
              </button>
            </div>
            {pumpsSpecificationFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{pumpsSpecification}</p> */}
                <MarkdownRenderer content={pumpsSpecification} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: pumpsSpecificationId,
                        fileName: "Dosing Pumps Specification",
                      })
                    );
                  }}
                >
                  Download Dosing Pumps Specification (docx)
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Dosing Quantity</h3>
              <button
                onClick={() => setDosingQuantityFlag(!dosingQuantityFlag)}
              >
                {dosingQuantityFlag ? "-" : "+"}
              </button>
            </div>
            {dosingQuantityFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{dosingQuantity}</p> */}
                <MarkdownRenderer content={dosingQuantity} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: dosingQuantityId,
                        fileName: "Dosing Quantity",
                      })
                    );
                  }}
                >
                  Download Dosing Quantity
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>PH correction or Boosting System</h3>
              <button onClick={() => setPhCorrectionFlag(!phCorrectionFlag)}>
                {phCorrectionFlag ? "-" : "+"}
              </button>
            </div>
            {phCorrectionFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{phCorrection}</p> */}
                <MarkdownRenderer content={phCorrection} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: phCorrectionId,
                        fileName: "PH correction or Boosting System",
                      })
                    );
                  }}
                >
                  Download PH correction or Boosting System
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Auto Handling System</h3>
              <button
                onClick={() =>
                  setAutoHandlingSystemFlag(!autoHandlingSystemFlag)
                }
              >
                {autoHandlingSystemFlag ? "-" : "+"}
              </button>
            </div>
            {autoHandlingSystemFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{autoHandlingSystem}</p> */}
                <MarkdownRenderer content={autoHandlingSystem} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: autoHandlingSystemId,
                        fileName: "Auto Handling System",
                      })
                    );
                  }}
                >
                  Download Auto Handling System
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div
            className={
              styles.ChemicalDosingCategory_container_content_downbtn_container
            }
          >
            <button
              className="category-download-btn"
              disabled={category.isLoading}
              onClick={() => {
                dispatch(
                  downloadPDF({
                    fileId: categoryId,
                    fileName: "ChemicalDosingSystem",
                  })
                );

                // downloadPdf(categoryId, "ChemicalDosingSystem");
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

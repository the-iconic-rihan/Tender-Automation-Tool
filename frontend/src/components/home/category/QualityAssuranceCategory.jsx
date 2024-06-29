import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { getErrorToast } from "../../../utils/useToast";
import {
  downloadDOCX,
  downloadPDF,
} from "../../../features/category/categorySlice";
import MarkdownRenderer from "../../common/MarkdownRenderer";

const QualityAssuranceCategory = () => {
  const [showContentFlag, setShowContentFlag] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [showQualityProcedureFlag, setShowQualityProcedureFlag] =
    useState(false);
  const [qualityProcedure, setQualityProcedure] = useState("");
  const [qualityProcedureId, setQualityProcedureId] = useState("");

  const [showQualityAssuranceFlag, setShowQualityAssuranceFlag] =
    useState(false);
  const [qualityAssurance, setQualityAssurance] = useState("");
  const [qualityAssuranceId, setQualityAssuranceId] = useState("");

  const [showDocumentationFlag, setShowDocumentationFlag] = useState(false);
  const [documentation, setDocumentation] = useState("");
  const [documentationId, setDocumentationId] = useState("");

  const [showTestCertificateFlag, setShowTestCertificateFlag] = useState(false);
  const [testCertificate, setTestCertificate] = useState("");
  const [testCertificateId, setTestCertificateId] = useState("");

  const [showInspectionProcedureFlag, setShowInspectionProcedureFlag] =
    useState(false);
  const [inspectionProcedure, setInspectionProcedure] = useState("");
  const [inspectionProcedureId, setInspectionProcedureId] = useState("");

  const [categoryId, setCategoryId] = useState("");

  const upload = useSelector((store) => store.upload);
  const category = useSelector((store) => store.category);
  const dispatch = useDispatch();

  useEffect(() => {
    getCategoryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCategoryData = async () => {
    const data = new FormData();
    data.append("tender_number", upload.tenderNo);
    data.append("tender_name", upload.tenderName);
    data.append("category_name", "Quality Assurance");

    let config = {
      method: "post",
      url: `${import.meta.env.VITE_BACKEND_URL}/dashboard/category-data/`,
      headers: {
        "content-type": "multipart/form-data",
      },
      data: data,
    };

    await axios(config)
      .then((response) => {
        const data = response.data["category_output"];

        if (typeof data === "undefined") {
          return;
        }

        if ("Quality Assurance" in data) {
          const qualityAssurance = data["Quality Assurance"];

          if ("Quality Control Procedure" in qualityAssurance) {
            const quProcedure = qualityAssurance["Quality Control Procedure"];

            setQualityProcedure(quProcedure["gpt_output"]);
            setQualityProcedureId(quProcedure["_id"]);
          }

          if ("Quality Assurance Plan" in qualityAssurance) {
            const quAssurance = qualityAssurance["Quality Assurance Plan"];

            setQualityAssurance(quAssurance["gpt_output"]);
            setQualityAssuranceId(quAssurance["_id"]);
          }

          if ("Documentation" in qualityAssurance) {
            const documentation = qualityAssurance["Documentation"];

            setDocumentation(documentation["gpt_output"]);
            setDocumentationId(documentation["_id"]);
          }

          if ("Test Certificate" in qualityAssurance) {
            const testCertificate = qualityAssurance["Test Certificate"];

            setTestCertificate(testCertificate["gpt_output"]);
            setTestCertificateId(testCertificate["_id"]);
          }

          if ("Inspection Procedure" in qualityAssurance) {
            const inspectionProcedure =
              qualityAssurance["Inspection Procedure"];

            setInspectionProcedure(inspectionProcedure["gpt_output"]);
            setInspectionProcedureId(inspectionProcedure["_id"]);
          }

          setCategoryId(data["Quality Assurance"]["category_output_id"]);
        }

        setIsLoading(!isLoading);
      })
      .catch((err) => console.log(err));
  };

  const downloadPdf = async (fileId, fileName) => {
    const pdfData = new FormData();
    pdfData.append("file_id", fileId);

    const config = {
      method: "post",
      url: `${import.meta.env.VITE_BACKEND_URL}/dashboard/download-category/`,
      headers: {
        "content-type": "multipart/form-data",
      },
      data: pdfData,
      responseType: "blob",
    };

    await axios(config)
      .then((response) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([response.data]));
        link.download = fileName + ".pdf";
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(link.href), 7000);
      })
      .catch((error) => {
        console.log(error);
        if (error?.response?.status === 404)
          getErrorToast("The file couldnot be found on the server!", 10000);
        else
          getErrorToast(
            "Oops the file couldnot be downloaded, something went wrong!"
          );
      });
  };

  const downloadDocx = async (fileId, fileName) => {
    const docxData = new FormData();
    docxData.append("file_id", fileId);

    const docxConfig = {
      method: "post",
      url: `${import.meta.env.VITE_BACKEND_URL}/dashboard/download-parameter/`,
      headers: {
        "content-type": "multipart/form-data",
      },
      data: docxData,
      responseType: "blob",
    };

    await axios(docxConfig)
      .then((response) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([response.data]));
        link.download = fileName + ".docx";
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(link.href), 7000);
      })
      .catch((error) => {
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
    <div className="category-main-container">
      <div className="category-heading-container">
        <h2>Quality Assurance</h2>

        <button
          onClick={() => setShowContentFlag(!showContentFlag)}
          style={{ cursor: isLoading ? "pointer" : "progress" }}
        >
          {showContentFlag && isLoading ? "-" : "+"}
        </button>
      </div>

      {showContentFlag && isLoading ? (
        <div className="category-content-container">
          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Quality Control Procedure</h3>
              <button
                onClick={() =>
                  setShowQualityProcedureFlag(!showQualityProcedureFlag)
                }
              >
                {showQualityProcedureFlag ? "-" : "+"}
              </button>
            </div>
            {showQualityProcedureFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{qualityProcedure}</p> */}
                <MarkdownRenderer content={qualityProcedure} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: qualityProcedureId,
                        fileName: "Quality Control Procedure",
                      })
                    );
                  }}
                >
                  Download Quality Control Procedure
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Quality Assurance Plan</h3>
              <button
                onClick={() =>
                  setShowQualityAssuranceFlag(!showQualityAssuranceFlag)
                }
              >
                {showQualityAssuranceFlag ? "-" : "+"}
              </button>
            </div>
            {showQualityAssuranceFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{qualityAssurance}</p> */}
                <MarkdownRenderer content={qualityAssurance} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: qualityAssuranceId,
                        fileName: "Quality Assurance Plan",
                      })
                    );
                  }}
                >
                  Download Quality Assurance Plan
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Documentation</h3>
              <button
                onClick={() => setShowDocumentationFlag(!showDocumentationFlag)}
              >
                {showDocumentationFlag ? "-" : "+"}
              </button>
            </div>
            {showDocumentationFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{documentation}</p> */}
                <MarkdownRenderer content={documentation} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: documentationId,
                        fileName: "Documentation",
                      })
                    );
                  }}
                // onClick={() => downloadDocx(documentationId, "Documentation")}
                >
                  Download Documentation
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Test Certificate</h3>
              <button
                onClick={() =>
                  setShowTestCertificateFlag(!showTestCertificateFlag)
                }
              >
                {showTestCertificateFlag ? "-" : "+"}
              </button>
            </div>
            {showTestCertificateFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{testCertificate}</p> */}
                <MarkdownRenderer content={testCertificate} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: testCertificateId,
                        fileName: "Test Certificate",
                      })
                    );
                  }}
                // onClick={() =>
                //   downloadDocx(testCertificateId, "Test Certificate")
                // }
                >
                  Download Test Certificate
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Inspection Procedure</h3>
              <button
                onClick={() =>
                  setShowInspectionProcedureFlag(!showInspectionProcedureFlag)
                }
              >
                {showInspectionProcedureFlag ? "-" : "+"}
              </button>
            </div>
            {showInspectionProcedureFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{inspectionProcedure}</p> */}
                <MarkdownRenderer content={inspectionProcedure} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: inspectionProcedureId,
                        fileName: "Inspection Procedure",
                      })
                    );
                  }}
                // onClick={() =>
                //   downloadDocx(inspectionProcedureId, "Inspection Procedure")
                // }
                >
                  Download Inspection Procedure
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="category-download-container">
            <button
              className="category-download-btn"
              disabled={category.isLoading}
              onClick={() => {
                dispatch(
                  downloadPDF({
                    fileId: categoryId,
                    fileName: "Quality Assurance",
                  })
                );
              }}
            // onClick={() => downloadPDF(categoryId, "Quality Assurance")}
            >
              Download Categorywise Extracted Tender
            </button>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default QualityAssuranceCategory;

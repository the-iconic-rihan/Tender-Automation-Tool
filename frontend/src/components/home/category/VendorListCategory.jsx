import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import styles from "../../../assets/css/VendorListCategory.module.css";
import "../../../assets/css/globalStyles.css";
import { getErrorToast } from "../../../utils/useToast";
import {
  downloadDOCX,
  downloadPDF,
  downloadXLSX,
} from "../../../features/category/categorySlice";
import MarkdownRenderer from "../../common/MarkdownRenderer";

export default function VendorListCategory() {
  const [showContentFlag, setShowContentFlag] = useState(false);
  const [showSpecificationFlag, setShowSpecificationFlag] = useState(false);
  const [mechanicalFlag, setMechanicalFlag] = useState(false);
  const [electricalFlag, setElectricalFlag] = useState(false);
  const [pipingFlag, setPipingFlag] = useState(false);

  const handleToggleButtonClick = () => {
    setShowContentFlag(!showContentFlag);
  };

  const [mechanical, setMechanical] = useState("");
  const [mechanicalId, setMechanicalId] = useState("");

  const [electrical, setElectrical] = useState("");
  const [electricalId, setElectricalId] = useState("");

  const [piping, setPiping] = useState("");
  const [pipingId, setPipingId] = useState("");

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
    data.append("category_name", "Vendor Lists and Makes");
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

        if ("Vendor Lists and Makes" in data) {
          const vList = data["Vendor Lists and Makes"];

          if ("Mechanical Bought out" in vList) {
            const mech = vList["Mechanical Bought out"];

            setMechanical(mech["gpt_output"]);
            setMechanicalId(mech["_id"]);
          }

          if ("Electrical and Instrumentation" in vList) {
            const elec = vList["Electrical and Instrumentation"];

            setElectrical(elec["gpt_output"]);
            setElectricalId(elec["_id"]);
          }

          if ("Piping and Valves Makes" in vList) {
            const pip = vList["Piping and Valves Makes"];

            setPiping(pip["gpt_output"]);
            setPipingId(pip["_id"]);
          }

          if ("Vendor List and Makes" in data["Vendor Lists and Makes"]) {
            setCategoryData(
              data["Vendor Lists and Makes"]["Vendor List and Makes"][
              "gpt_output"
              ]
            );
            setSpecificationId(
              data["Vendor Lists and Makes"]["Vendor List and Makes"]["_id"]
            );
          }
          setCategoryId(data["Vendor Lists and Makes"]["category_output_id"]);
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
    <div className={styles.VendorListCategory_Container}>
      <div className={styles.VendorListCategory_container_heading}>
        <h2>Vendor List and Makes</h2>
        <button
          onClick={() => handleToggleButtonClick()}
          style={{ cursor: isLoading ? "pointer" : "progress" }}
        >
          {showContentFlag && isLoading ? "-" : "+"}
        </button>
      </div>

      {showContentFlag && isLoading ? (
        <div className={styles.VendorListCategory_container_content}>
          {/* <div
            className={
              styles.VendorListCategory_container_content_specification_container
            }
          >
            <div
              className={
                styles.VendorListCategory_container_content_specification_container_1_row
              }
            >
              <h3
                className={
                  styles.VendorListCategory_container_content_specification_container_heading
                }
              >
                Specification
              </h3>
              <button
                className={
                  styles.VendorListCategory_container_content_specification_container_btn
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
                  styles.VendorListCategory_container_content_specification_container_2_row
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
              <h3>Mechanical Bought out</h3>
              <button onClick={() => setMechanicalFlag(!mechanicalFlag)}>
                {mechanicalFlag ? "-" : "+"}
              </button>
            </div>
            {mechanicalFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{mechanical}</p> */}
                <MarkdownRenderer content={mechanical} />
                <div className="sub-category-download-btn-container">
                  <button
                    className="sub-category-download-btn"
                    disabled={category.isLoading}
                    onClick={() => {
                      dispatch(
                        downloadDOCX({
                          fileId: mechanicalId,
                          fileName: "Mechanical Bought out",
                        })
                      );
                    }}
                  >
                    Download Mechanical Bought out (docx)
                  </button>

                  <button
                    className="sub-category-download-btn"
                    disabled={category.isLoading}
                    onClick={() =>
                      dispatch(
                        downloadXLSX({
                          fileId: mechanicalId,
                          fileName: "Mechanical Bought out",
                        })
                      )
                    }
                  >
                    Download Mechanical Bought out (xlsx)
                  </button>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Electrical and Instrumentation</h3>
              <button onClick={() => setElectricalFlag(!electricalFlag)}>
                {electricalFlag ? "-" : "+"}
              </button>
            </div>
            {electricalFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{electrical}</p> */}
                <MarkdownRenderer content={electrical} />
                <div className="sub-category-download-btn-container">
                  <button
                    className="sub-category-download-btn"
                    disabled={category.isLoading}
                    onClick={() => {
                      dispatch(
                        downloadDOCX({
                          fileId: electricalId,
                          fileName: "Electrical and Instrumentation",
                        })
                      );
                    }}
                  >
                    Download Electrical and Instrumentation (docx)
                  </button>
                  <button
                    className="sub-category-download-btn"
                    disabled={category.isLoading}
                    onClick={() =>
                      dispatch(
                        downloadXLSX({
                          fileId: electricalId,
                          fileName: "Electrical and Instrumentation",
                        })
                      )
                    }
                  >
                    Download Electrical and Instrumentation (xlsx)
                  </button>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Piping and Valves Makes</h3>
              <button onClick={() => setPipingFlag(!pipingFlag)}>
                {pipingFlag ? "-" : "+"}
              </button>
            </div>
            {pipingFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{piping}</p> */}
                <MarkdownRenderer content={piping} />
                <div className="sub-category-download-btn-container">
                  <button
                    className="sub-category-download-btn"
                    disabled={category.isLoading}
                    onClick={() => {
                      dispatch(
                        downloadDOCX({
                          fileId: pipingId,
                          fileName: "Piping and Valves Makes",
                        })
                      );
                    }}
                  >
                    Download Piping and Valves Makes (docx)
                  </button>
                  <button
                    className="sub-category-download-btn"
                    disabled={category.isLoading}
                    onClick={() =>
                      dispatch(
                        downloadXLSX({
                          fileId: pipingId,
                          fileName: "Piping and Valves Makes",
                        })
                      )
                    }
                  >
                    Download Piping and Valves Makes (xlsx)
                  </button>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div
            className={
              styles.VendorListCategory_container_content_downbtn_container
            }
          >
            <button
              className="category-download-btn"
              disabled={category.isLoading}
              onClick={() => {
                dispatch(
                  downloadPDF({ fileId: categoryId, fileName: "VendorList" })
                );

                // downloadPdf(categoryId, "VendorList");
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

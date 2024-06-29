import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import styles from "../../../assets/css/FinalCapacityCategory.module.css";
import "../../../assets/css/globalStyles.css";
import { getErrorToast } from "../../../utils/useToast";
import {
  downloadDOCX,
  downloadPDF,
  downloadXLSX,
} from "../../../features/category/categorySlice";
import MarkdownRenderer from "../../common/MarkdownRenderer";

export default function FinalCapacityCategory() {
  const [showContentFlag, setShowContentFlag] = useState(false);
  const [showDmCapacityFlag, setShowDmCapacityFlag] = useState(false);
  const [operatingHoursFlag, setOperatingHoursFlag] = useState(false);
  const [plantCapacityFlag, setPlantCapacityFlag] = useState(false);

  // const [showWaterCapacityFlag, setShowWaterCapacityFlag] = useState(false);
  // const [showOperatingPlantFlag, setShowOperatingPlantFlag] = useState(false);
  const upload = useSelector((store) => store.upload);
  const category = useSelector((store) => store.category);
  const [isLoading, setIsLoading] = useState(false);
  const handleToggleButtonClick = () => {
    setShowContentFlag(!showContentFlag);
  };

  // const [dmCapacity, setDmCapacity] = useState("");
  // const [smCapacity, setSmCapacity] = useState("");
  // const [operatingHours, setOperatingHours] = useState("");
  const [specificationData, setSpecificationData] = useState("");
  const [specificationId, setSpecificationId] = useState("");

  const [operatingHours, setOperatingHours] = useState("");
  const [operatingHoursId, setOperatingHoursId] = useState("");

  const [plantCapacity, setPlantCapacity] = useState("");
  const [plantCapacityId, setPlantCapacityId] = useState("");

  // const [dmCapacityId, setDmCapacityId] = useState("");
  // const [smCapacityId, setSmCapacityId] = useState("");
  // const [operatingHoursId, setOperatingHoursId] = useState("");
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
    data.append("category_name", "Final Product Capacity");
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
        if ("Final Product Capacity" in data) {
          if ("operational hours" in data["Final Product Capacity"]) {
            setOperatingHours(
              data["Final Product Capacity"]["operational hours"]["gpt_output"]
            );

            setOperatingHoursId(
              data["Final Product Capacity"]["operational hours"]["_id"]
            );
          }

          if ("plant capacity" in data["Final Product Capacity"]) {
            setPlantCapacity(
              data["Final Product Capacity"]["plant capacity"]["gpt_output"]
            );

            setPlantCapacityId(
              data["Final Product Capacity"]["plant capacity"]["_id"]
            );
          }

          // if (
          //   "plant_capacity_operating_hours" in data["Final Product Capacity"]
          // ) {
          //   setSpecificationData(
          //     data["Final Product Capacity"]["plant_capacity_operating_hours"][
          //       "gpt_output"
          //     ]
          //   );
          //   setSpecificationId(
          //     data["Final Product Capacity"]["plant_capacity_operating_hours"][
          //       "_id"
          //     ]
          //   );
          // }
          setCategoryId(data["Final Product Capacity"]["category_output_id"]);
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
    <div className={styles.FinalCapacityCategory_Cotainer}>
      <div className={styles.FinalCapacityCategory_container_heading}>
        <h2>Final product capacity</h2>
        <button
          onClick={() => handleToggleButtonClick()}
          style={{ cursor: isLoading ? "pointer" : "progress" }}
        >
          {showContentFlag && isLoading ? "-" : "+"}
        </button>
      </div>
      {showContentFlag && isLoading ? (
        <div className={styles.FinalCapacityCategory_container_content}>
          {/* <div
            className={
              styles.FinalCapacityCategory_container_content_dm_capacity_container
            }
          >
            <div
              className={
                styles.FinalCapacityCategory_container_content_dm_capacity_container_1_row
              }
            >
              <h3
                className={
                  styles.FinalCapacityCategory_container_content_dm_capacity_container_heading
                }
              >
                Specification
              </h3>
              <button
                className={
                  styles.FinalCapacityCategory_container_content_dm_capacity_container_btn
                }
                onClick={() => {
                  setShowDmCapacityFlag(!showDmCapacityFlag);
                }}
              >
                {showDmCapacityFlag ? "-" : "+"}
              </button>
            </div>
            {showDmCapacityFlag ? (
              <div
                className={
                  styles.FinalCapacityCategory_container_content_dm_capacity_container_2_row
                }
              >
                <p>{specificationData}</p>
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: specificationId,
                        fileName: "specification",
                      })
                    );

                    // downloadDocx(specificationId, "specification");
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
              <h3>Operational Hours</h3>
              <button
                onClick={() => setOperatingHoursFlag(!operatingHoursFlag)}
              >
                {operatingHoursFlag ? "-" : "+"}
              </button>
            </div>
            {operatingHoursFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{operatingHours}</p> */}
                <MarkdownRenderer content={operatingHours} />
                <div className="sub-category-download-btn-container">
                  <button
                    className="sub-category-download-btn"
                    disabled={category.isLoading}
                    onClick={() => {
                      dispatch(
                        downloadDOCX({
                          fileId: operatingHoursId,
                          fileName: "Operational Hours",
                        })
                      );
                    }}
                  >
                    Download Operational Hours (docx)
                  </button>

                  <button
                    className="sub-category-download-btn"
                    disabled={category.isLoading}
                    onClick={() =>
                      dispatch(
                        downloadXLSX({
                          fileId: operatingHoursId,
                          fileName: "Operational Hours",
                        })
                      )
                    }
                  >
                    Download Operational Hours (xlsx)
                  </button>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Plant Capacity</h3>
              <button onClick={() => setPlantCapacityFlag(!plantCapacityFlag)}>
                {plantCapacityFlag ? "-" : "+"}
              </button>
            </div>
            {plantCapacityFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{plantCapacity}</p> */}
                <MarkdownRenderer content={plantCapacity} />
                <div className="sub-category-download-btn-container">
                  <button
                    className="sub-category-download-btn"
                    disabled={category.isLoading}
                    onClick={() => {
                      dispatch(
                        downloadDOCX({
                          fileId: plantCapacityId,
                          fileName: "Plant Capacity",
                        })
                      );
                    }}
                  >
                    Download Plant Capacity (docx)
                  </button>
                  <button
                    className="sub-category-download-btn"
                    disabled={category.isLoading}
                    onClick={() =>
                      dispatch(
                        downloadXLSX({
                          fileId: plantCapacityId,
                          fileName: "Plant Capacity",
                        })
                      )
                    }
                  >
                    Download Plant Capacity (xlsx)
                  </button>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div
            className={
              styles.FinalCapacityCategory_container_content_downbtn_container
            }
          >
            <button
              className="category-download-btn"
              disabled={category.isLoading}
              onClick={() => {
                dispatch(
                  downloadPDF({
                    fileId: categoryId,
                    fileName: "FinalProductCapacity",
                  })
                );

                // downloadPdf(categoryId, "FinalProductCapacity");
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

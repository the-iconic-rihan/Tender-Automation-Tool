import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import styles from "../../../assets/css/PsfCategory.module.css";
import "../../../assets/css/globalStyles.css";
import { getErrorToast } from "../../../utils/useToast";
import {
  downloadDOCX,
  downloadPDF,
} from "../../../features/category/categorySlice";

export default function PsfCategory() {
  const [showContentFlag, setShowContentFlag] = useState(false);
  const [showValvesFlag, setShowValvesFlag] = useState(false);
  // const [showPressureFlag, setShowPressureFlag] = useState(false);
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
    data.append("category_name", "PSF");
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
        if ("PSF" in data) {
          if ("psf_specifications" in data["PSF"]) {
            setCategoryData(data["PSF"]["psf_specifications"]["gpt_output"]);
            setSpecificationId(data["PSF"]["psf_specifications"]["_id"]);
          }
          setCategoryId(data["PSF"]["category_output_id"]);
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
        if (error?.response?.status === 404)
          getErrorToast("The file couldnot be found on the server!", 10000);
        else
          getErrorToast(
            "Oops the file couldnot be downloaded, something went wrong!"
          );
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
  return (
    <div className={styles.PsfCategory_Container}>
      <div
        className={styles.PsfCategory_container_heading}
        style={{ cursor: isLoading ? "pointer" : "progress" }}
      >
        <h2>PSF</h2>
        <button onClick={() => handleToggleButtonClick()}>
          {showContentFlag && isLoading ? "-" : "+"}
        </button>
      </div>
      {showContentFlag && isLoading ? (
        <div className={styles.PsfCategory_container_content}>
          <div
            className={styles.PsfCategory_container_content_valves_container}
          >
            <div
              className={
                styles.PsfCategory_container_content_valves_container_1_row
              }
            >
              <h3
                className={
                  styles.PsfCategory_container_content_valves_container_heading
                }
              >
                Specification
              </h3>
              <button
                className={
                  styles.PsfCategory_container_content_valves_container_btn
                }
                onClick={() => {
                  setShowValvesFlag(!showValvesFlag);
                }}
              >
                {showValvesFlag ? "-" : "+"}
              </button>
            </div>
            {showValvesFlag ? (
              <div
                className={
                  styles.PsfCategory_container_content_valves_container_2_row
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
          </div>

          <div
            className={styles.PsfCategory_container_content_downbtn_container}
          >
            <button
              className="category-download-btn"
              disabled={category.isLoading}
              onClick={() => {
                dispatch(downloadPDF({ fileId: categoryId, fileName: "PSF" }));

                // downloadPdf(categoryId, "PSF");
              }}
            >
              Download PSF
            </button>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

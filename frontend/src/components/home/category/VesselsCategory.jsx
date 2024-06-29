import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import styles from "../../../assets/css/VesselsCategory.module.css";
import "../../../assets/css/globalStyles.css";
import { getErrorToast } from "../../../utils/useToast";
import {
  downloadDOCX,
  downloadPDF,
} from "../../../features/category/categorySlice";
import MarkdownRenderer from "../../common/MarkdownRenderer";
import SubCategory from "../../common/SubCategory";

export default function VesselsCategory() {
  const [showContentFlag, setShowContentFlag] = useState(false);
  const [showSpecificationFlag, setShowSpecificationFlag] = useState(false);
  const upload = useSelector((store) => store.upload);
  const category = useSelector((store) => store.category);
  const [isLoading, setIsLoading] = useState(false);
  const handleToggleButtonClick = () => {
    setShowContentFlag(!showContentFlag);
  };

  const [storageTanks, setStorageTanks] = useState("");
  const [storageTanksId, setStorageTanksId] = useState("");

  const [otherTanks, setOtherTanks] = useState("");
  const [otherTanksId, setOtherTanksId] = useState("");

  const [VesselsData, setVesselsData] = useState("");
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
    data.append("category_name", "Tanks");
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

        if ("Tanks" in data) {
          const ves = data["Tanks"];

          if ("Storage Tanks specifications" in ves) {
            const stoTnk = ves["Storage Tanks specifications"];

            setStorageTanks(stoTnk["gpt_output"]);
            setStorageTanksId(stoTnk["_id"]);
          }

          if ("Other Tanks" in ves) {
            const othTank = ves["Other Tanks"];

            setOtherTanks(othTank["gpt_output"]);
            setOtherTanksId(othTank["_id"]);
          }

          // if ("vessels specifications" in data["Tanks"]) {
          //   setVesselsData(
          //     data["Tanks"]["vessels specifications"]["gpt_output"]
          //   );
          //   setSpecificationId(
          //     data["Tanks"]["vessels specifications"]["_id"]
          //   );
          // }
          setCategoryId(data["Tanks"]["category_output_id"]);
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
    <div className={styles.VesselsCategory_Container}>
      <div className={styles.VesselsCategory_container_heading}>
        <h2>Tanks</h2>
        <button
          onClick={() => handleToggleButtonClick()}
          style={{ cursor: isLoading ? "pointer" : "progress" }}
        >
          {showContentFlag && isLoading ? "-" : "+"}
        </button>
      </div>

      {showContentFlag && isLoading ? (
        <div className={styles.VesselsCategory_container_content}>
          {/* <div
            className={
              styles.VesselsCategory_container_content_specification_container
            }
          >
            <div
              className={
                styles.VesselsCategory_container_content_specification_container_1_row
              }
            >
              <h3
                className={
                  styles.VesselsCategory_container_content_specification_container_heading
                }
              >
                Vessels Specification
              </h3>
              <button
                className={
                  styles.VesselsCategory_container_content_specification_container_btn
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
                  styles.VesselsCategory_container_content_specification_container_2_row
                }
              >
                <MarkdownRenderer content={VesselsData} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: specificationId,
                        fileName: "Vessels Specification",
                      })
                    );

                    // downloadDocx(specificationId, "Specification");
                  }}
                >
                  Download Vessels Specification
                </button>
              </div>
            ) : (
              ""
            )}
          </div> */}

          <SubCategory
            name={"Storage Tanks specifications"}
            data={storageTanks}
            id={storageTanksId}
          />

          <SubCategory
            name={"Other Tanks"}
            data={otherTanks}
            id={otherTanksId}
          />

          <div
            className={
              styles.VesselsCategory_container_content_downbtn_container
            }
          >
            <button
              className="category-download-btn"
              disabled={category.isLoading}
              onClick={() => {
                dispatch(
                  downloadPDF({
                    fileId: categoryId,
                    fileName: "Tank Details",
                  })
                );

                // downloadPdf(categoryId, "VesselsDetails");
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

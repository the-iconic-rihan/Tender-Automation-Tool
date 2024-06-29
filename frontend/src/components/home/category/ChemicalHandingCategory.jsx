import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import styles from "../../../assets/css/ChemicalHandingCategory.module.css";
import "../../../assets/css/globalStyles.css";
import { getErrorToast } from "../../../utils/useToast";
import {
  downloadDOCX,
  downloadPDF,
} from "../../../features/category/categorySlice";
import MarkdownRenderer from "../../common/MarkdownRenderer";
import SubCategory from "../../common/SubCategory";

export default function ChemicalHandingCategory() {
  const [showContentFlag, setShowContentFlag] = useState(false);
  const [showChemicalFlag, setShowChemicalFlag] = useState(false);
  // const [showVaccumFlag, setShowVaccumFlag] = useState(false);
  const handleToggleButtonClick = () => {
    setShowContentFlag(!showContentFlag);
  };

  const [caustic, setCaustic] = useState("");
  const [causticId, setCausticId] = useState("");

  const [hcl, setHcl] = useState("");
  const [hclId, setHclId] = useState("");

  const [h2so4, setH2so4] = useState("");
  const [h2so4Id, setH2so4Id] = useState("");

  const [otherChemicals, setOtherChemicals] = useState("");
  const [otherChemicalsId, setOtherChemicalsId] = useState("");

  const [unloadingPumps, setUnloadingPumps] = useState("");
  const [unloadingPumpsId, setUnloadingPumpsId] = useState("");

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
    data.append("category_name", "Chemical Handling System");
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
        if ("Chemical Handling System" in data) {
          const chs = data["Chemical Handling System"];

          if ("chemical_handling_system" in data["Chemical Handling System"]) {
            setCategoryData(
              data["Chemical Handling System"]["chemical_handling_system"][
              "gpt_output"
              ]
            );
            setSpecificationId(
              data["Chemical Handling System"]["chemical_handling_system"][
              "_id"
              ]
            );
          }

          if ("bulk caustic handling system" in chs) {
            const csH = chs["bulk caustic handling system"];

            setCaustic(csH["gpt_output"]);
            setCausticId(csH["_id"]);
          }

          if ("bulk hydrochloric acid handling system" in chs) {
            const hclAc = chs["bulk hydrochloric acid handling system"];

            setHcl(hclAc["gpt_output"]);
            setHclId(hclAc["_id"]);
          }

          if ("bulk sulphuric acid handling system" in chs) {
            const data = chs["bulk sulphuric acid handling system"];

            setH2so4(data["gpt_output"]);
            setH2so4Id(data["_id"]);
          }

          if ("other chemical bulk handling system" in chs) {
            const data = chs["other chemical bulk handling system"];

            setOtherChemicals(data["gpt_output"]);
            setOtherChemicalsId(data["_id"]);
          }

          if ("unloading pumps" in chs) {
            const data = chs["unloading pumps"];

            setUnloadingPumps(data["gpt_output"]);
            setUnloadingPumpsId(data["_id"]);
          }

          setCategoryId(data["Chemical Handling System"]["category_output_id"]);
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
    <div className={styles.ChemicalHandingCategory_Container}>
      <div className={styles.ChemicalHandingCategory_container_heading}>
        <h2>Chemical handing system</h2>
        <button
          onClick={() => handleToggleButtonClick()}
          style={{ cursor: isLoading ? "pointer" : "progress" }}
        >
          {showContentFlag && isLoading ? "-" : "+"}
        </button>
      </div>
      {showContentFlag && isLoading ? (
        <div className={styles.ChemicalHandingCategory_container_content}>
          {/* <div
            className={
              styles.ChemicalHandingCategory_container_content_chemical_container
            }
          >
            <div
              className={
                styles.ChemicalHandingCategory_container_content_chemical_container_1_row
              }
            >
              <h3
                className={
                  styles.ChemicalHandingCategory_container_content_chemical_container_heading
                }
              >
                Chemical Handling System
              </h3>
              <button
                className={
                  styles.ChemicalHandingCategory_container_content_chemical_container_btn
                }
                onClick={() => {
                  setShowChemicalFlag(!showChemicalFlag);
                }}
              >
                {showChemicalFlag ? "-" : "+"}
              </button>
            </div>
            {showChemicalFlag ? (
              <div
                className={
                  styles.ChemicalHandingCategory_container_content_chemical_container_2_row
                }
              >
                <MarkdownRenderer content={CategoryData} />
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

                  }}
                >
                  Download Chemical Handling System
                </button>
              </div>
            ) : (
              ""
            )}
          </div> */}

          <SubCategory name="Caustic" data={caustic} id={causticId} />

          <SubCategory name="HCL" data={hcl} id={hclId} />

          <SubCategory name="H2SO4" data={h2so4} id={h2so4Id} />

          <SubCategory
            name="Other Chemicals"
            data={otherChemicals}
            id={otherChemicalsId}
          />

          <SubCategory
            name="Unloading Pumps"
            data={unloadingPumps}
            id={unloadingPumpsId}
          />

          <div
            className={
              styles.ChemicalHandingCategory_container_content_downbtn_container
            }
          >
            <button
              className="category-download-btn"
              disabled={category.isLoading}
              onClick={() => {
                dispatch(
                  downloadPDF({
                    fileId: categoryId,
                    fileName: "ChemicalHandingSystem",
                  })
                );

                // downloadPdf(categoryId, "ChemicalHandingSystem");
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

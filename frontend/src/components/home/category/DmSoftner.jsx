import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { getErrorToast } from "../../../utils/useToast";
import {
  downloadDOCX,
  downloadPDF,
  downloadXLSX,
} from "../../../features/category/categorySlice";
import MarkdownRenderer from "../../common/MarkdownRenderer";

const DmSoftner = () => {
  const [showContentFlag, setShowContentFlag] = useState(false);
  const [plantFlag, setPlantFlag] = useState(false);
  const [softnerFlag, setSoftnerFlag] = useState(false);

  const [plant, setPlant] = useState("");
  const [plantId, setPlantId] = useState("");

  const [softner, setSoftner] = useState("");
  const [softnerId, setSoftnerId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [categoryId, setCategoryId] = useState("");

  const upload = useSelector((store) => store.upload);
  const category = useSelector((store) => store.category);

  const dispatch = useDispatch();

  useEffect(() => {
    getCategoryData();
  }, []);

  const getCategoryData = async () => {
    let data = new FormData();
    data.append("tender_number", upload.tenderNo);
    data.append("tender_name", upload.tenderName);
    data.append("category_name", "DM Plant and Softner");

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

        if ("DM Plant and Softner" in data) {
          const plantAndSoftner = data["DM Plant and Softner"];

          if ("DM Plant" in plantAndSoftner) {
            const plant = plantAndSoftner["DM Plant"];

            setPlant(plant["gpt_output"]);
            setPlantId(plant["_id"]);
          }

          if ("Softener" in plantAndSoftner) {
            const softner = plantAndSoftner["Softener"];

            setSoftner(softner["gpt_output"]);
            setSoftnerId(softner["_id"]);
          }

          setCategoryId(data["DM Plant and Softner"]["category_output_id"]);
        }

        setIsLoading(!isLoading);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className="category-main-container">
      <div className="category-heading-container">
        <h2>DM Plant and Softeners</h2>

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
              <h3>DM Plant</h3>
              <button onClick={() => setPlantFlag(!plantFlag)}>
                {plantFlag ? "-" : "+"}
              </button>
            </div>
            {plantFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{plant}</p> */}
                <MarkdownRenderer content={plant} />
                <div className="sub-category-download-btn-container">
                  <button
                    className="sub-category-download-btn"
                    disabled={category.isLoading}
                    onClick={() => {
                      dispatch(
                        downloadDOCX({
                          fileId: plantId,
                          fileName: "DM Plant",
                        })
                      );
                    }}
                  >
                    Download DM Plant (docx)
                  </button>
                  <button
                    className="sub-category-download-btn"
                    disabled={category.isLoading}
                    onClick={() =>
                      dispatch(
                        downloadXLSX({
                          fileId: plantId,
                          fileName: "DM Plant",
                        })
                      )
                    }
                  >
                    Download  DM Plant (xlsx)
                  </button>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Softeners</h3>
              <button onClick={() => setSoftnerFlag(!softnerFlag)}>
                {softnerFlag ? "-" : "+"}
              </button>
            </div>
            {softnerFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{softner}</p> */}
                <MarkdownRenderer content={softner} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: softnerId,
                        fileName: "Softeners",
                      })
                    );
                  }}
                >
                  Download Softeners
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
                    fileName: "Filters",
                  })
                );
              }}
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

export default DmSoftner;

import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { getErrorToast } from "../../../utils/useToast";
import {
  downloadDOCX,
  downloadPDF,
} from "../../../features/category/categorySlice";
import MarkdownRenderer from "../../common/MarkdownRenderer";

const UfRoUnit = () => {
  const [showContentFlag, setShowContentFlag] = useState(false);
  const [ufUnitFlag, setUfUnitFlag] = useState(false);
  const [roUnitFlag, setRoUnitFlag] = useState("");

  const [ufUnit, setUfUnit] = useState("");
  const [ufUnitId, setUfUnitId] = useState("");

  const [roUnit, setRoUnit] = useState("");
  const [roUnitId, setRoUnitId] = useState("");

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
    data.append("category_name", "UF and RO unit");

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
        const data = response.data["category_output"];

        if (typeof data === "undefined") {
          return;
        }

        if ("UF and RO unit" in data) {
          const units = data["UF and RO unit"];

          if ("UF unit" in units) {
            const uf = units["UF unit"];

            setUfUnit(uf["gpt_output"]);
            setUfUnitId(uf["_id"]);
          }

          if ("RO unit" in units) {
            const ro = units["RO unit"];

            setRoUnit(ro["gpt_output"]);
            setRoUnitId(ro["_id"]);
          }

          setCategoryId(units["category_output_id"]);
        }

        setIsLoading(!isLoading);
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className="category-main-container">
      <div className="category-heading-container">
        <h2>UF and RO unit</h2>

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
              <h3>UF Unit</h3>
              <button onClick={() => setUfUnitFlag(!ufUnitFlag)}>
                {ufUnitFlag ? "-" : "+"}
              </button>
            </div>
            {ufUnitFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{ufUnit}</p> */}
                <MarkdownRenderer content={ufUnit} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: ufUnitId,
                        fileName: "UF Unit",
                      })
                    );
                  }}
                >
                  Download UF Unit
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>RO Unit</h3>
              <button onClick={() => setRoUnitFlag(!roUnitFlag)}>
                {roUnitFlag ? "-" : "+"}
              </button>
            </div>
            {roUnitFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{roUnit}</p> */}
                <MarkdownRenderer content={roUnit} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: roUnitId,
                        fileName: "RO Unit",
                      })
                    );
                  }}
                >
                  Download RO Unit
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
                    fileName: "UF and RO unit",
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

export default UfRoUnit;

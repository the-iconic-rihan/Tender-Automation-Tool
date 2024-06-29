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
import SubCategory from "../../common/SubCategory";

export default function FiltersCategory() {
  const [showContentFlag, setShowContentFlag] = useState(false);
  const [acfFlag, setAcfFlag] = useState(false);
  const [irfFlag, setIrfFlag] = useState(false);
  const [psfFlag, setPsfFlag] = useState(false);

  const [acf, setAcf] = useState("");
  const [acfId, setAcfId] = useState("");

  const [irf, setIrf] = useState("");
  const [irfId, setIrfId] = useState("");

  const [psf, setPsf] = useState("");
  const [psfId, setPsfId] = useState("");

  const [ssf, setSsf] = useState("");
  const [ssfId, setSsfId] = useState("");

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
    data.append("category_name", "Filters");

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

        if ("Filters" in data) {
          const filters = data["Filters"];

          if ("ACF or LLACF" in filters) {
            const acf = filters["ACF or LLACF"];

            setAcf(acf["gpt_output"]);
            setAcfId(acf["_id"]);
          }

          if ("IRF" in filters) {
            const irf = filters["IRF"];

            setIrf(irf["gpt_output"]);
            setIrfId(irf["_id"]);
          }

          if ("MGF or PSF or DMF" in filters) {
            const psf = filters["MGF or PSF or DMF"];

            setPsf(psf["gpt_output"]);
            setPsfId(psf["_id"]);
          }

          if ("SSF" in filters) {
            const ssf = filters["SSF"];

            setSsf(ssf["gpt_output"]);
            setSsfId(ssf["_id"]);
          }

          setCategoryId(data["Filters"]["category_output_id"]);
        }

        setIsLoading(!isLoading);
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className="category-main-container">
      <div className="category-heading-container">
        <h2>Filters</h2>

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
              <h3>MGF or PSF or DMF</h3>
              <button onClick={() => setPsfFlag(!psfFlag)}>
                {psfFlag ? "-" : "+"}
              </button>
            </div>
            {psfFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{psf}</p> */}
                <MarkdownRenderer content={psf} />
                <div className="sub-category-download-btn-container">
                  <button
                    className="sub-category-download-btn"
                    disabled={category.isLoading}
                    onClick={() => {
                      dispatch(
                        downloadDOCX({
                          fileId: psfId,
                          fileName: "MGF or PSF or DMF",
                        })
                      );
                    }}
                  >
                    Download MGF OR PSF OR DMF (docx)
                  </button>

                  <button
                    className="sub-category-download-btn"
                    disabled={category.isLoading}
                    onClick={() =>
                      dispatch(
                        downloadXLSX({
                          fileId: psfId,
                          fileName: "MGF or PSF or DMF",
                        })
                      )
                    }
                  >
                    Download MGF OR PSF OR DMF (xlsx)
                  </button>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>ACF OR LLACF</h3>
              <button onClick={() => setAcfFlag(!acfFlag)}>
                {acfFlag ? "-" : "+"}
              </button>
            </div>
            {acfFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{acf}</p> */}
                <MarkdownRenderer content={acf} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: acfId,
                        fileName: "ACF OR LLACF",
                      })
                    );
                  }}
                >
                  Download ACF OR LLACF
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>IRF</h3>
              <button onClick={() => setIrfFlag(!irfFlag)}>
                {irfFlag ? "-" : "+"}
              </button>
            </div>
            {irfFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{irf}</p> */}
                <MarkdownRenderer content={irf} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: irfId,
                        fileName: "IRF",
                      })
                    );
                  }}
                >
                  Download IRF
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <SubCategory name={"SSF"} data={ssf} id={ssfId} />

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
}

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../../assets/css/globalStyles.css";
import { downloadDOCX, downloadXLSX } from "../../features/category/categorySlice";
import MarkdownRenderer from "./MarkdownRenderer";

const SubCategory = ({
  name,
  data,
  id,
  children,
  isXlsxAv,
}) => {
  const [flag, setFlag] = useState(false);

  const category = useSelector((state) => state.category);
  const dispatch = useDispatch();

  return (
    <>
      <div className="sub_category-container">
        <div className="sub_category-heading-container">
          <h3>{name}</h3>
          <button
            disabled={!data}
            style={{
              cursor: data ? "pointer" : "not-allowed",
            }}
            onClick={() => setFlag(!flag)}
          >
            {flag ? "-" : "+"}
          </button>
        </div>

        {data && flag ? (
          <div className="sub_category-content-container">
            <MarkdownRenderer content={data} />

            <div className="sub-category-download-btn-container">
              <button
                disabled={category.isLoading}
                className="sub-category-download-btn"
                onClick={() => {
                  dispatch(
                    downloadDOCX({
                      fileId: id,
                      fileName: name,
                    })
                  );
                }}
              >
                Download {name}
              </button>

              {isXlsxAv && (
                <button
                  disabled={category.isLoading}
                  className="sub-category-download-btn"
                  onClick={() => {
                    dispatch(
                      downloadXLSX({
                        fileId: id,
                        fileName: name,
                      })
                    );
                  }}
                >
                  Download XLSX format
                </button>
              )}
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
      {children}
    </>
  );
};

export default SubCategory;

import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  downloadDOCX,
  downloadPDF,
} from "../../../features/category/categorySlice";
import MarkdownRenderer from "../../common/MarkdownRenderer";
import SubCategory from "../../common/SubCategory";

const AdditionalInformationCategory = () => {
  const [showContentFlag, setShowContentFlag] = useState(false);

  const [weldingSpecs, setWeldingSpecs] = useState("");
  const [weldingSpecsId, setWeldingSpecsId] = useState("");

  const [paintingSpecs, setPaintingSpecs] = useState("");
  const [paintingSpecsId, setPaintingSpecsId] = useState("");

  const [warranty, setWarranty] = useState("");
  const [warrantyId, setWarrantyId] = useState("");

  const [drawings, setDrawings] = useState("");
  const [drawingsId, setDrawingsId] = useState("");

  const [afterDrawings, setAfterDrawings] = useState("");
  const [afterDrawingsId, setAfterDrawingsId] = useState("");

  const [materialPkg, setMaterialPkg] = useState("");
  const [materialPkgId, setMaterialPkgId] = useState("");

  const [spares, setSpares] = useState("");
  const [sparesId, setSparesId] = useState("");

  const [isLoading, setIsLoading] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const upload = useSelector((store) => store.upload);
  const category = useSelector((store) => store.category);

  const dispatch = useDispatch();

  useEffect(() => {
    getCategoryData();
  }, []);

  const getCategoryData = async () => {
    const data = new FormData();
    data.append("tender_number", upload.tenderNo);
    data.append("tender_name", upload.tenderName);
    data.append("category_name", "Additional Information");

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

        if ("Additional Information" in data) {
          const ai = data["Additional Information"];

          if ("Welding Specifications" in ai) {
            const ws = ai["Welding Specifications"];

            setWeldingSpecs(ws["gpt_output"]);
            setWeldingSpecsId(ws["_id"]);
          }

          if ("Painting Specifications" in ai) {
            const ps = ai["Painting Specifications"];

            setPaintingSpecs(ps["gpt_output"]);
            setPaintingSpecsId(ps["_id"]);
          }

          if ("Warranty" in ai) {
            const warranty = ai["Warranty"];

            setWarranty(warranty["gpt_output"]);
            setWarrantyId(warranty["_id"]);
          }

          if (
            "Drawing and Documents to be submitted along with the offer" in ai
          ) {
            const drdoc =
              ai["Drawing and Documents to be submitted along with the offer"];

            setDrawings(drdoc["gpt_output"]);
            setDrawingsId(drdoc["_id"]);
          }

          if (
            "Drawing and Documents to be submitted after award of contract" in
            ai
          ) {
            const afterDrDoc =
              ai[
              "Drawing and Documents to be submitted after award of contract"
              ];

            setAfterDrawings(afterDrDoc["gpt_output"]);
            setAfterDrawingsId(afterDrDoc["_id"]);
          }

          if ("Material Packaging and Shipment" in ai) {
            const mps = ai["Material Packaging and Shipment"];

            setMaterialPkg(mps["gpt_output"]);
            setMaterialPkgId(mps["_id"]);
          }

          if ("Spares" in ai) {
            const sp = ai["Spares"];

            setSpares(sp["gpt_output"]);
            setSparesId(sp["_id"]);
          }

          setCategoryId(ai["category_output_id"]);
        }

        setIsLoading(!isLoading);
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className="category-main-container">
      <div className="category-heading-container">
        <h2>Additional Information</h2>

        <button
          onClick={() => setShowContentFlag(!showContentFlag)}
          style={{ cursor: isLoading ? "pointer" : "progress" }}
        >
          {showContentFlag && isLoading ? "-" : "+"}
        </button>
      </div>

      {showContentFlag && isLoading ? (
        <div className="category-content-container">
          <SubCategory
            name={"Welding Specifications"}
            data={weldingSpecs}
            id={weldingSpecsId}
          />

          <SubCategory
            name={"Painting Specifications"}
            data={paintingSpecs}
            id={paintingSpecsId}
          />
          <SubCategory name={"Warranty"} data={warranty} id={warrantyId} />
          <SubCategory
            name={"Drawing and Documents to be submitted along with the offer"}
            data={drawings}
            id={drawingsId}
          />
          <SubCategory
            name={
              "Drawing and Documents to be submitted after award of contract"
            }
            data={afterDrawings}
            id={afterDrawingsId}
          />
          <SubCategory
            name={"Material Packaging and Shipment"}
            data={materialPkg}
            id={materialPkgId}
          />

          <SubCategory
            name={"Spares"}
            data={spares}
            id={sparesId}
            isXlsxAv={true}
            xlsxName={"asd"}
          />

          <div className="category-download-container">
            <button
              className="category-download-btn"
              disabled={category.isLoading}
              onClick={() => {
                dispatch(
                  downloadPDF({
                    fileId: categoryId,
                    fileName: "Additional Information",
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

export default AdditionalInformationCategory;

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import styles from "../../../assets/css/Category.module.css";
import "../../../assets/css/globalStyles.css";
import GeneralCategory from "./GeneralCategory";
import ContactCategory from "./ContactCategory";
import WorkCategory from "./WorkCategory";
import TechnicalRequirementCategory from "./TechnicalRequirementCategory";
import TreatmentSchemeCategory from "./TreatmentSchemeCategory";
import LocationLayoutCategory from "./LocationLayoutCategory";
import FinalCapacityCategory from "./FinalCapacityCategory";
import RawWaterCategory from "./RawWaterCategory";
import PretreatmentCategory from "./PretreatmentCategory";
import PumpCategory from "./PumpCategory";
import PipingCategory from "./PipingCategory";
import ValveCategory from "./ValveCategory";
import MccPanelCategory from "./MccPanelCategory";
import MotorCategoty from "./MotorCategory";
import CableCategory from "./CableCategory";
import CableTrayCategory from "./CableTrayCategory";
import LPBSRequirementsCategory from "./LPBSRequirementsCategory";
import EarthingCategory from "./EarthingCategory";
import VendorListCategory from "./VendorListCategory";
import ChemicalDosingCategory from "./ChemicalDosingCategory";
import ChemicalHandingCategory from "./ChemicalHandingCategory";
import PsfCategory from "./PsfCategory";
import AcfCategory from "./AcfCategory";
import LlAcfCategory from "./LlacfCategory";
import OthersCategory from "./OthersCategory";
import VesselsCategory from "./VesselsCategory";
import InstrumentationsCategory from "./InstrumentationsCategory";
import QualityAssuranceCategory from "./QualityAssuranceCategory";
import FiltersCategory from "./FiltersCategory";
import DmSoftner from "./DmSoftner";
import UfRoUnit from "./UfRoUnit";
import AdditionalInformationCategory from "./AdditionalInformationCategory";
import { downloadCumulativeFile, fetchCumulitiveId } from "../../../features/category/categorySlice";

const Category = () => {
  const upload = useSelector((state) => state.upload);
  const category = useSelector((store) => store.category);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  useEffect(() => {
    if (!upload.tenderName) navigate("/page/dashboard");

    const data = new FormData();
    data.append("tender_number", upload.tenderNo);
    data.append("tender_name", upload.tenderName);
    dispatch(fetchCumulitiveId(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dHan = () => {
    dispatch(downloadCumulativeFile())
      .unwrap()
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  };

  return (
    <div className={styles.Category_container}>
      <div className={styles.Category_container_heading}>
        <h2>Category</h2>
      </div>
      <div className={styles.Category_container_content}>
        <GeneralCategory />
        <ContactCategory />
        <WorkCategory />
        <TechnicalRequirementCategory />
        <TreatmentSchemeCategory />
        <LocationLayoutCategory />
        <FinalCapacityCategory />
        <RawWaterCategory />
        <PretreatmentCategory />
        <ChemicalDosingCategory />
        <ChemicalHandingCategory />
        {/* <PsfCategory />
        <AcfCategory />
        <LlAcfCategory /> */}
        <FiltersCategory />
        <VendorListCategory />
        <DmSoftner />
        <UfRoUnit />
        <VesselsCategory />
        <PumpCategory />
        <PipingCategory />
        <ValveCategory />
        <MccPanelCategory />
        <MotorCategoty />
        <CableCategory />
        <CableTrayCategory />
        <LPBSRequirementsCategory />
        <EarthingCategory />
        <QualityAssuranceCategory />
        <InstrumentationsCategory />
        <AdditionalInformationCategory />
        <OthersCategory />

        <div className="download-all-contents-container">
          <button
            className="category-download-btn"
            disabled={category.isLoading}
            onClick={dHan}
          >
            Download Cumulative Summary
          </button>
        </div>
      </div>
    </div>
  );
};

export default Category;

import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import "../../../assets/css/Category.css";
import { getErrorToast } from "../../../utils/useToast";
import {
  downloadDOCX,
  downloadPDF,
} from "../../../features/category/categorySlice";
import MarkdownRenderer from "../../common/MarkdownRenderer";
import SubCategory from "../../common/SubCategory";

const InstrumentationsCategory = () => {
  const [showContentFlag, setShowContentFlag] = useState(false);
  const [showSpecificationFlag, setShowSpecificationFlag] = useState(false);

  const [showTransmitterFlag, setShowTransmitterFlag] = useState(false);
  const [showFlowMetersFlag, setShowFlowMetersFlag] = useState(false);
  const [
    showQualityMeasuringInstrumentsFlag,
    setShowQualityMeasuringInstrumentsFlag,
  ] = useState(false);
  const [showSwitchFlag, setShowSwitchFlag] = useState(false);
  const [showGaugeFlag, setShowGaugeFlag] = useState(false);
  const [showSolenoidValveBoxFlag, setShowSolenoidValveBoxFlag] =
    useState(false);
  const [otherInsFlag, setOtherInsFlag] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [instrumentationData, setInstrumentationData] = useState("");
  const [specificationId, setSpecificationId] = useState("");

  const [transmitterData, setTransmitterData] = useState("");
  const [transmitterDataId, setTransmitterDataId] = useState("");

  const [flowMetersData, setFlowMetersData] = useState("");
  const [flowMetersDataId, setFlowMetersDataId] = useState("");

  const [qualityMeasuringInstrumentsData, setQualityMeasuringInstrumentsData] =
    useState("");
  const [
    qualityMeasuringInstrumentsDataId,
    setQualityMeasuringInstrumentsDataId,
  ] = useState("");

  const [switchData, setSwitchData] = useState("");
  const [switchDataId, setSwitchDataId] = useState("");

  const [gaugeData, setGaugeData] = useState("");
  const [gaugeDataId, setGaugeDataId] = useState("");

  const [solenoidValveBoxData, setSolenoidValveBoxData] = useState("");
  const [solenoidValveBoxDataId, setSolenoidValveBoxDataId] = useState("");

  const [otherIns, setOtherIns] = useState("");
  const [otherInsId, setOtherInsId] = useState("");

  const [instSummary, setInstSummary] = useState("");
  const [instSummaryId, setInstSummaryId] = useState("");

  const [categoryId, setCategoryId] = useState("");

  const upload = useSelector((store) => store.upload);
  const category = useSelector((store) => store.category);
  const dispatch = useDispatch();

  useEffect(() => {
    getCategoryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCategoryData = async () => {
    const data = new FormData();
    data.append("tender_number", upload.tenderNo);
    data.append("tender_name", upload.tenderName);
    data.append("category_name", "Instruments");

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

        if ("Instruments" in data) {
          const instrumentations = data["Instruments"];

          if ("instruments specification" in data["Instruments"]) {
            setInstrumentationData(
              data["Instruments"]["instruments specification"]["gpt_output"]
            );
            setSpecificationId(
              data["Instruments"]["instruments specification"]["_id"]
            );
          }

          if ("Transmitter" in instrumentations) {
            setTransmitterData(instrumentations["Transmitter"]["gpt_output"]);
            setTransmitterDataId(instrumentations["Transmitter"]["_id"]);
          }

          if ("Flow meters" in instrumentations) {
            setFlowMetersData(instrumentations["Flow meters"]["gpt_output"]);
            setFlowMetersDataId(instrumentations["Flow meters"]["_id"]);
          }

          if ("Quality measuring instruments" in instrumentations) {
            setQualityMeasuringInstrumentsData(
              instrumentations["Quality measuring instruments"]["gpt_output"]
            );
            setQualityMeasuringInstrumentsDataId(
              instrumentations["Quality measuring instruments"]["_id"]
            );
          }

          if ("Switch" in instrumentations) {
            setSwitchData(instrumentations["Switch"]["gpt_output"]);
            setSwitchDataId(instrumentations["Switch"]["_id"]);
          }

          if ("Gauge" in instrumentations) {
            setGaugeData(instrumentations["Gauge"]["gpt_output"]);
            setGaugeDataId(instrumentations["Gauge"]["_id"]);
          }

          if ("Solenoid valve box" in instrumentations) {
            setSolenoidValveBoxData(
              instrumentations["Solenoid valve box"]["gpt_output"]
            );
            setSolenoidValveBoxDataId(
              instrumentations["Solenoid valve box"]["_id"]
            );
          }

          if ("Instruments Summary" in instrumentations) {
            setInstSummary(
              instrumentations["Instruments Summary"]["gpt_output"]
            );
            setInstSummaryId(
              instrumentations["Instruments Summary"]["_id"]
            );
          }

          if ("Other Instruments" in instrumentations) {
            setOtherIns(instrumentations["Other Instruments"]["gpt_output"]);
            setOtherInsId(instrumentations["Other Instruments"]["_id"]);
          }

          setCategoryId(data["Instruments"]["category_output_id"]);
        }

        setIsLoading(!isLoading);
      })
      .catch((err) => console.log(err));
  };

  const downloadPdf = async (fileId, fileName) => {
    const pdfData = new FormData();
    pdfData.append("file_id", fileId);

    const config = {
      method: "post",
      url: `${import.meta.env.VITE_BACKEND_URL}/dashboard/download-category/`,
      headers: {
        "content-type": "multipart/form-data",
      },
      data: pdfData,
      responseType: "blob",
    };

    await axios(config)
      .then((response) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([response.data]));
        link.download = fileName + ".pdf";
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(link.href), 7000);
      })
      .catch((error) => {
        console.log(error);
        if (error?.response?.status === 404)
          getErrorToast("The file couldnot be found on the server!", 10000);
        else
          getErrorToast(
            "Oops the file couldnot be downloaded, something went wrong!"
          );
      });
  };

  const downloadDocx = async (fileId, fileName) => {
    const docxData = new FormData();
    docxData.append("file_id", fileId);

    const docxConfig = {
      method: "post",
      url: `${import.meta.env.VITE_BACKEND_URL}/dashboard/download-parameter/`,
      headers: {
        "content-type": "multipart/form-data",
      },
      data: docxData,
      responseType: "blob",
    };

    await axios(docxConfig)
      .then((response) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([response.data]));
        link.download = fileName + ".docx";
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(link.href), 7000);
      })
      .catch((error) => {
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
    <div className="category-main-container">
      <div className="category-heading-container">
        <h2>Instrumentations</h2>

        <button
          onClick={() => setShowContentFlag(!showContentFlag)}
          style={{ cursor: isLoading ? "pointer" : "progress" }}
        >
          {showContentFlag && isLoading ? "-" : "+"}
        </button>
      </div>

      {showContentFlag && isLoading ? (
        <div className="category-content-container">
          {/* <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Specification</h3>
              <button
                onClick={() => {
                  setShowSpecificationFlag(!showSpecificationFlag);
                }}
              >
                {showSpecificationFlag ? "-" : "+"}
              </button>
            </div>
            {showSpecificationFlag ? (
              <div className="sub_category-content-container">
                <p>{instrumentationData}</p>
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: specificationId,
                        fileName: "Instrumentation Specification",
                      })
                    );
                  }}
                  // onClick={() =>
                  //   downloadDocx(
                  //     specificationId,
                  //     "Instrumentation_Specification"
                  //   )
                  // }
                >
                  Download Specification
                </button>
              </div>
            ) : (
              <></>
            )}
          </div> */}

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Transmitter</h3>
              <button
                onClick={() => {
                  setShowTransmitterFlag(!showTransmitterFlag);
                }}
              >
                {showTransmitterFlag ? "-" : "+"}
              </button>
            </div>
            {showTransmitterFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{transmitterData}</p> */}
                <MarkdownRenderer content={transmitterData} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: transmitterDataId,
                        fileName: "Transmitter",
                      })
                    );
                  }}
                >
                  Download Transmitter
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          {/* <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Flow Meters</h3>
              <button
                onClick={() => {
                  setShowFlowMetersFlag(!showFlowMetersFlag);
                }}
              >
                {showFlowMetersFlag ? "-" : "+"}
              </button>
            </div>
            {showFlowMetersFlag ? (
              <div className="sub_category-content-container">
                <p>{flowMetersData}</p>
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: flowMetersDataId,
                        fileName: "Flow Meters",
                      })
                    );
                  }}
                >
                  Download Flow Meters
                </button>
              </div>
            ) : (
              <></>
            )}
          </div> */}

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Quality measuring instruments</h3>
              <button
                onClick={() => {
                  setShowQualityMeasuringInstrumentsFlag(
                    !showQualityMeasuringInstrumentsFlag
                  );
                }}
              >
                {showQualityMeasuringInstrumentsFlag ? "-" : "+"}
              </button>
            </div>
            {showQualityMeasuringInstrumentsFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{qualityMeasuringInstrumentsData}</p> */}
                <MarkdownRenderer content={qualityMeasuringInstrumentsData} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: qualityMeasuringInstrumentsDataId,
                        fileName: "Quality measuring instruments",
                      })
                    );
                  }}
                >
                  Download Quality measuring instruments
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Switch</h3>
              <button
                onClick={() => {
                  setShowSwitchFlag(!showSwitchFlag);
                }}
              >
                {showSwitchFlag ? "-" : "+"}
              </button>
            </div>
            {showSwitchFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{switchData}</p> */}
                <MarkdownRenderer content={switchData} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: switchDataId,
                        fileName: "Switch",
                      })
                    );
                  }}
                >
                  Download Switch
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Gauge</h3>
              <button
                onClick={() => {
                  setShowGaugeFlag(!showGaugeFlag);
                }}
              >
                {showGaugeFlag ? "-" : "+"}
              </button>
            </div>
            {showGaugeFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{gaugeData}</p> */}
                <MarkdownRenderer content={gaugeData} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: gaugeDataId,
                        fileName: "Gauge",
                      })
                    );
                  }}
                >
                  Download Gauge
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Solenoid Valve Box</h3>
              <button
                onClick={() => {
                  setShowSolenoidValveBoxFlag(!showSolenoidValveBoxFlag);
                }}
              >
                {showSolenoidValveBoxFlag ? "-" : "+"}
              </button>
            </div>
            {showSolenoidValveBoxFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{solenoidValveBoxData}</p> */}
                <MarkdownRenderer content={solenoidValveBoxData} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: solenoidValveBoxDataId,
                        fileName: "Solenoid Valve Box",
                      })
                    );
                  }}
                >
                  Download Solenoid Valve Box
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="sub_category-container">
            <div className="sub_category-heading-container">
              <h3>Other Instruments</h3>
              <button
                onClick={() => {
                  setOtherInsFlag(!otherInsFlag);
                }}
              >
                {otherInsFlag ? "-" : "+"}
              </button>
            </div>
            {otherInsFlag ? (
              <div className="sub_category-content-container">
                {/* <p>{otherIns}</p> */}
                <MarkdownRenderer content={otherIns} />
                <button
                  className="sub-category-download-btn"
                  disabled={category.isLoading}
                  onClick={() => {
                    dispatch(
                      downloadDOCX({
                        fileId: otherInsId,
                        fileName: "Other Instruments",
                      })
                    );
                  }}
                >
                  Download Other Instruments
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>

          <SubCategory
            name={"Instruments Summary"}
            data={instSummary}
            id={instSummaryId}
            isXlsxAv={true}
          />

          {/* => */}

          <div className="category-download-container">
            <button
              className="category-download-btn"
              disabled={category.isLoading}
              onClick={() => {
                dispatch(
                  downloadPDF({
                    fileId: categoryId,
                    fileName: "Instruments",
                  })
                );
              }}
            // onClick={() => downloadPDF(categoryId, "Instruments")}
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

export default InstrumentationsCategory;

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import styles from "../../../assets/css/ContactCategory.module.css";
import "../../../assets/css/globalStyles.css";
import { getErrorToast } from "../../../utils/useToast";
import {
  downloadDOCX,
  downloadPDF,
} from "../../../features/category/categorySlice";

import MarkdownRenderer from "../../common/MarkdownRenderer";

export default function ContactCategory() {
  const [showContentFlag, setShowContentFlag] = useState(false);
  const [contact, setcontact] = useState("");
  const [contactId, setContactId] = useState("");
  const upload = useSelector((store) => store.upload);
  const category = useSelector((store) => store.category);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const handleToggleButtonClick = () => {
    setShowContentFlag(!showContentFlag);
  };

  useEffect(() => {
    getCategoryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getCategoryData = async () => {
    let data = new FormData();
    data.append("tender_number", upload.tenderNo);
    data.append("tender_name", upload.tenderName);
    data.append("category_name", "Contact Details");
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
        if ("Contact Details" in data) {
          if ("contact" in data["Contact Details"]) {
            setcontact(data["Contact Details"]["contact"]["gpt_output"]);
            setContactId(data["Contact Details"]["contact"]["_id"]);
          }
          setCategoryId(data["Contact Details"]["category_output_id"]);
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
    <div className={styles.ContactCategory_container}>
      <div className={styles.ContactCategory_container_heading}>
        <h2>Contact Information</h2>
        <button
          onClick={() => handleToggleButtonClick()}
          style={{ cursor: isLoading ? "pointer" : "progress" }}
        >
          {showContentFlag && isLoading ? "-" : "+"}
        </button>
      </div>
      {showContentFlag && isLoading ? (
        <div className={styles.ContactCategory_container_content}>
          <div
            className={
              styles.ContactCategory_container_content_details_container
            }
          >
            <h3
              className={
                styles.ContactCategory_container_content_details_container_heading
              }
            >
              Details
            </h3>
            {/* <p>{contact}</p> */}
            <MarkdownRenderer content={contact} />

            <button
              disabled={category.isLoading}
              onClick={() => {
                dispatch(
                  downloadDOCX({
                    fileId: contactId,
                    fileName: "Contact Details",
                  })
                );
              }}
              className="sub-category-download-btn"
            >
              Download Contact Details
            </button>
            {/* <div
              className={
                styles.ContactCategory_container_content_details_container_name_container
              }
            >
              <h3>Name &nbsp;:&nbsp;</h3>
              <h3>{name}</h3>
            </div>
            <div
              className={
                styles.ContactCategory_container_content_details_container_email_container
              }
            >
              <h3>Email &nbsp;:&nbsp;</h3>
              <h3>{email}</h3>
            </div>
            <div
              className={
                styles.ContactCategory_container_content_details_container_phone_container
              }
            >
              <h3>Phone &nbsp;:&nbsp;</h3>
              <h3>{phoneNumber}</h3>
            </div>
            <div
              className={
                styles.ContactCategory_container_content_details_container_address_container
              }
            >
              <h3>Address &nbsp;:&nbsp;</h3>
              <h3>{address}</h3>
            </div> */}
          </div>
          <div
            className={
              styles.ContactCategory_container_content_downbtn_container
            }
          >
            <button
              className="category-download-btn"
              disabled={category.isLoading}
              onClick={() => {
                dispatch(
                  downloadPDF({
                    fileId: categoryId,
                    fileName: "ContactDetails",
                  })
                );

                // downloadPdf(categoryId, "CD");
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

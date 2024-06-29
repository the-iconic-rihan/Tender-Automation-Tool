import React, { useState } from "react";
import Modal from "../../common/Modal";
import axios from "axios";
import { getErrorToast, getSuccessToast } from "../../../utils/useToast";
import { useDispatch } from "react-redux";
import { getTenderFiles } from "../../../features/dashboard/dashboardSlice";

const TenderActions = (data) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dispatch = useDispatch();

  const deleteHandler = (e) => {
    e.stopPropagation();

    // const reqData = JSON.stringify({
    //   tender_name: data.row.original.tender_name,
    //   tender_number: data.row.original.tender_number,
    // });

    console.log(data.row.original);

    const reqData = new FormData();
    reqData.append("tender_name", data.row.original.tender_name);
    reqData.append("tender_number", data.row.original.tender_number);

    axios
      .post(
        `${import.meta.env.VITE_BACKEND_URL}/dashboard/delete_tender/`,
        reqData
      )
      .then((res) => {
        getSuccessToast("Tender deleted successfully");
        console.log(res);

        dispatch(getTenderFiles(data.row.original.division));
      })
      .catch((err) => {
        console.log(err);

        getErrorToast("There was an error while deleting the tender");
      });
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsModalOpen(true);
        }}
        className="delete_bin-btn"
        style={{
          background: "transparent",
          border: "none",
        }}
        // disabled
      >
        <svg
          width="20px"
          height="20px"
          viewBox="0 0 0.6 0.6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.192 0.218H0.125v-0.014h0.121m-0.054 0.014V0.475h0.215V0.218m-0.215 0h0.215m0 0H0.475v-0.014h-0.121m-0.108 0V0.15h0.108v0.054m-0.108 0h0.108"
            stroke="inherit"
            strokeWidth={0.037500000000000006}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M0.25 0.275v0.15"
            stroke="inherit"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={0.025}
          />
          <path
            d="M0.3 0.275v0.15"
            stroke="inherit"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={0.025}
          />
          <path
            d="M0.35 0.275v0.15"
            stroke="inherit"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={0.025}
          />
        </svg>
      </button>
      <Modal
        style={{
          width: "750px",
          zIndex: 1000,
        }}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <p
          style={{
            textAlign: "left",
            fontSize: "1rem",
            marginBottom: "1rem",
          }}
        >
          Do you really want to delete this tender? Deleting this tender will
          delete all the files and metadata associated with it
        </p>
        <div className="unt_modal-btn-container">
          <button
            onClick={(e) => {
              e.stopPropagation();

              setIsModalOpen(false);
            }}
          >
            No
          </button>
          <button onClick={(e) => deleteHandler(e)}>Delete</button>
        </div>
      </Modal>
    </>
  );
};

export default TenderActions;

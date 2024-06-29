import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import "../../assets/css/Header.css";
import avatar from "../../assets/images/avatar.svg";
import ddIcon from "../../assets/images/dropdown.svg";
import dimensionlessLogo from "../../assets/images/dimensionless_logo.svg";
import { logout, verifyDivision } from "../../features/auth/authSlice";
import {
  getErrorToast,
  getInfoToast,
  getSuccessToast,
} from "../../utils/useToast";
import Select from "react-select";
import { Tooltip } from "react-tooltip";

import Modal from "./Modal";

const options = [
  {
    value: "WWS_SPG",
    label: "WWS_SPG",
  },
  {
    value: "WWS_IPG",
    label: "WWS_IPG",
  },
  {
    value: "WWS_Services",
    label: "WWS_Services",
  },
];

const Header = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { username, division } = useSelector((state) => state.auth);
  const upload = useSelector((state) => state.upload);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const logoutHandler = () => {
    dispatch(logout())
      .unwrap()
      .then(() => {
        localStorage.clear();

        navigate("/");
      })
      .catch((error) => {
        getErrorToast(error);
      });
  };

  const changeProfileHandler = (e) => {
    if (division === e.value) {
      getInfoToast("You have selected the same profile!!!", 2500);
      return;
    }

    const data = new FormData();
    data.append("username", username);
    data.append("division", e.value);

    dispatch(verifyDivision(data))
      .unwrap()
      .then((data) => {
        getSuccessToast("Division changed successfully", 500);
        localStorage.setItem("division", data.division);
        setIsModalOpen(false);
      })
      .catch((err) => {
        getErrorToast(err);
      });
  };

  return (
    <>
      <div className="header-container">
        <div
          style={{
            backgroundColor:
              location.pathname.includes("dashboard") ||
                location.pathname === "/page/upload" ||
                location.pathname === "/page/tender-files"
                ? "#fff"
                : "#edf4f9",
          }}
          className="header-division-container"
        >
          {location.pathname.includes("dashboard") ||
            location.pathname === "/page/upload" ||
            location.pathname === "/page/tender-files" ? (
            ""
          ) : (
            <p
              data-tooltip-id="header-tooltip"
              data-tooltip-content={upload.tenderName}
            >
              {upload.tenderName && upload.tenderName}
            </p>
          )}
        </div>

        <div className="header_details-container">
          <div className="header-division-container">
            <p>{division}</p>
          </div>

          <div
            onClick={() => setIsDialogOpen((prev) => !prev)}
            className="header-user-container"
          >
            <div className="hu-img-container">
              <img src={avatar} alt="" />
            </div>
            <p className="hu-username">{username?.split("@")[0]}</p>
            <div className="header-dropdown-container">
              <img
                src={ddIcon}
                width={25}
                height={25}
                alt="dropdown"
                className="header-dropdown-img"
              />
              {isDialogOpen && (
                <div className="dialog">
                  {location.pathname.includes("dashboard") && (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="modal-btn"
                    >
                      Change Profile
                    </button>
                  )}
                  <button onClick={logoutHandler} className="modal-btn">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="header-dimensionless_logo-container">
            <img src={dimensionlessLogo} alt="" />
          </div>
        </div>
      </div>
      <Modal
        style={{ paddingTop: 0 }}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <p
          style={{
            color: "#186daa",
            fontWeight: 600,
            padding: "16px 0",
          }}
        >
          Select another profile
        </p>

        <Select options={options} onChange={changeProfileHandler} />
      </Modal>
      <Tooltip id="header-tooltip" />
    </>
  );
};

export default Header;

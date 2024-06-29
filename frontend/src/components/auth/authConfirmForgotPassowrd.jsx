import { useRef, useState } from "react";

import {
  addDivision,
  confirmForgotPassword,
} from "../../features/auth/authSlice";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import back_icon from "../../assets/images/back_icon.svg";
import show from "../../assets/images/show.svg";
import hide from "../../assets/images/hide.svg";

import "src/assets/css/authResetPassword.css";
import { getErrorToast, getSuccessToast } from "../../utils/useToast";

const AuthConfirmForgotPassowrd = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [newPasswordType, setNewPasswordType] = useState("password");
  const [confirmPasswordType, setConfirmPasswordType] = useState("password");

  const [invalidCredentials, setInvalidCredentials] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [displayWarning, setDisplayWarning] = useState(false);

  const passwordRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading } = useSelector((state) => state.auth);

  const regex =
    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;

  const newPasswordTypingStyles = {
    background: newPassword !== "" && "inherit",
    backgroundSize: newPassword !== "" && "0",
    backgroundPosition: newPassword !== "" && "0",
    textIndent: newPassword !== "" && "0",
  };

  const confirmPasswordTypingStyles = {
    background: confirmPassword !== "" && "inherit",
    backgroundSize: confirmPassword !== "" && "0",
    backgroundPosition: confirmPassword !== "" && "0",
    textIndent: confirmPassword !== "" && "0",
  };

  const submitHandler = (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      getErrorToast("Passwords do not match. Please try again.", 5000);
      return;
    }

    if (!regex.test(newPassword)) {
      getErrorToast("Please enter a valid password.", 5000);
      passwordRef.current.focus();
      return;
    }

    setErrorMessage("");
    setInvalidCredentials(false);

    const passwordData = new FormData();
    passwordData.append("new_password", newPassword);
    passwordData.append("confirm_password", confirmPassword);

    const pathArr = location.pathname.split("/");

    console.log(pathArr);

    const uid = pathArr[pathArr.length - 3];
    const token = pathArr[pathArr.length - 2];

    const requestData = {
      data: passwordData,
      uid,
      token,
    };

    console.log(requestData);

    dispatch(confirmForgotPassword(requestData))
      .unwrap()
      .then((data) => {
        if (data.success) {
          dispatch(addDivision(data.division));
          getSuccessToast("Your password has been changed successfully.", 5000);
          navigate("/page/dashboard");
        } else {
          getSuccessToast(
            "Your password has been changed successfully. Please login again",
            5000
          );
          navigate("/auth");
        }
      })
      .catch((err) => {
        console.log(err);

        setErrorMessage(err);
        setInvalidCredentials(true);
      });
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-navigator-container">
        <img
          src={back_icon}
          onClick={() => navigate("/auth/forgot-password")}
        />
      </div>
      <div className="reset-password-main-container">
        <h3 style={{ textAlign: "center" }} className="login-heading">
          ENTER NEW PASSOWRD
        </h3>

        <form className="form-container" onSubmit={submitHandler}>
          <div className="login-input-section" style={newPasswordTypingStyles}>
            <label htmlFor="new-password" className="password-label">
              New Password
            </label>
            <div
              className={`
          user-input-section user-password-section ${invalidCredentials ? "invalid-password" : ""
                }`}
            >
              <input
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className=" user-input user-password"
                type={newPasswordType}
                placeholder="Enter Password"
                required
                onFocus={() => setDisplayWarning(true)}
                onBlur={() => setDisplayWarning(false)}
                ref={passwordRef}
              />
              <div className="password-icon">
                <img
                  onClick={() =>
                    setNewPasswordType(
                      newPasswordType === "password" ? "text" : "password"
                    )
                  }
                  src={newPasswordType === "password" ? show : hide}
                  alt="password-toggle"
                />
              </div>
            </div>

            {displayWarning && (
              <small
                style={{
                  color: "#186daa",
                  fontWeight: 600,
                  marginTop: "0.5rem",
                }}
              >
                Your password must be at least 8 characters long and include a
                combination of letters (either uppercase or lowercase), numbers,
                and special characters
              </small>
            )}
          </div>

          <div
            className="login-input-section"
            style={confirmPasswordTypingStyles}
          >
            <label htmlFor="confirm-password" className="password-label">
              Confirm Password
            </label>
            <div
              className={`
          user-input-section user-password-section ${invalidCredentials ? "invalid-password" : ""
                }`}
            >
              <input
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className=" user-input user-password"
                type={confirmPasswordType}
                placeholder="Enter Password"
                required
              />
              <div className="password-icon">
                <img
                  onClick={() =>
                    setConfirmPasswordType(
                      confirmPasswordType === "password" ? "text" : "password"
                    )
                  }
                  src={confirmPasswordType === "password" ? show : hide}
                  alt="password-toggle"
                />
              </div>
            </div>
          </div>
          {invalidCredentials && (
            <small className="invalid-password_message">errorMessage</small>
          )}
          <button disabled={isLoading} className="login-btn reset-password-btn">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthConfirmForgotPassowrd;

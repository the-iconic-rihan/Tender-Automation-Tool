import { useState } from "react";

import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import back_icon from "../../assets/images/back_icon.svg";
import show from "../../assets/images/show.svg";
import hide from "../../assets/images/hide.svg";

import "src/assets/css/authResetPassword.css";
import { resetPassword } from "../../features/auth/authSlice";
import { getErrorToast } from "../../utils/useToast";

const AuthResetPassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [oldPasswordType, setOldPasswordType] = useState("password");
  const [newPasswordType, setNewPasswordType] = useState("password");
  const [confirmPasswordType, setConfirmPasswordType] = useState("password");

  const [invalidCredentials, setInvalidCredentials] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { username, isLoading } = useSelector((state) => state.auth);

  const oldPasswordTypingStyles = {
    background: oldPassword !== "" && "inherit",
    backgroundSize: oldPassword !== "" && "0",
    backgroundPosition: oldPassword !== "" && "0",
    textIndent: oldPassword !== "" && "0",
  };

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

    if (oldPassword.trim() === newPassword.trim()) {
      getErrorToast(
        "The new password cannot be same as the old password!",
        5000
      );

      return;
    }

    if (newPassword !== confirmPassword) {
      getErrorToast("Passwords do not match. Please try again.", 5000);
      return;
    }

    setErrorMessage("");
    setInvalidCredentials(false);

    const userData = new FormData();
    userData.append("username", username);
    userData.append("old_password", oldPassword);
    userData.append("new_password", confirmPassword);

    dispatch(resetPassword(userData))
      .unwrap()
      .then((res) => {
        navigate("/page/dashboard");
      })
      .catch((err) => {
        setErrorMessage(err);
        setInvalidCredentials(true);
      });
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-navigator-container">
        <img src={back_icon} onClick={() => navigate("/auth")} />
      </div>
      <div className="reset-password-main-container">
        <h3 style={{ textAlign: "center" }} className="login-heading">
          reset password
        </h3>
        <form className="form-container" onSubmit={submitHandler}>
          <div className="login-input-section" style={oldPasswordTypingStyles}>
            <label htmlFor="old-password" className="password-label">
              Old Password
            </label>
            <div
              className={`
          user-input-section user-password-section ${
            invalidCredentials ? "invalid-password" : ""
          }`}
            >
              <input
                id="old-password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className=" user-input user-password"
                type={oldPasswordType}
                placeholder="Enter Password"
                required
              />
              <div className="password-icon">
                <img
                  onClick={() =>
                    setOldPasswordType(
                      oldPasswordType === "password" ? "text" : "password"
                    )
                  }
                  src={oldPasswordType === "password" ? show : hide}
                  alt="password-toggle"
                />
              </div>
            </div>
          </div>

          <div className="login-input-section" style={newPasswordTypingStyles}>
            <label htmlFor="new-password" className="password-label">
              New Password
            </label>
            <div
              className={`
          user-input-section user-password-section ${
            invalidCredentials ? "invalid-password" : ""
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
          user-input-section user-password-section ${
            invalidCredentials ? "invalid-password" : ""
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
            <small className="invalid-password_message">{errorMessage}</small>
          )}
          <button disabled={isLoading} className="login-btn reset-password-btn">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthResetPassword;

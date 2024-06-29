import { useState } from "react";

import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import back_icon from "../../assets/images/back_icon.svg";
import show from "../../assets/images/show.svg";
import hide from "../../assets/images/hide.svg";
import "src/assets/css/authForgotPassword.css";
import { forgotPassword } from "../../features/auth/authSlice";
import { getSuccessToast } from "../../utils/useToast";

const AuthForgotPassword = () => {
  const [username, setUsername] = useState("");
  const [invalidCredentials, setInvalidCredentials] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const { isLoading } = useSelector((state) => state.auth);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const emailTypingStyles = {
    background: username !== "" && "inherit",
    backgroundSize: username !== "" && "0",
    backgroundPosition: username !== "" && "0",
    textIndent: username !== "" && "0",
  };

  const submitHandler = (e) => {
    e.preventDefault();

    setErrorMessage("");
    setInvalidCredentials(false);

    const formData = new FormData();

    formData.append("email", username);

    dispatch(forgotPassword(formData))
      .unwrap()
      .then((res) => {
        console.log(res);

        getSuccessToast(
          "A new link has been generated and sent to your registered  email address."
        );
      })
      .catch((error) => {
        setErrorMessage(error);
        setInvalidCredentials(true);
      });
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-navigator-container">
        <img src={back_icon} onClick={() => navigate("/auth")} />
      </div>

      <div className="forgot-password-main-container">
        <h3 style={{ textAlign: "center" }} className="login-heading">
          Forgot password ?
        </h3>

        <form onSubmit={submitHandler} className="form-container">
          <div className="login-input-section" style={emailTypingStyles}>
            <label htmlFor="username" className="username-label">
              Email
            </label>
            <div
              className={`user-input-section  ${
                invalidCredentials ? "invalid-username" : ""
              }`}
            >
              <input
                type="email"
                id="username"
                onChange={(e) => setUsername(e.target.value)}
                value={username}
                className="user-input"
                placeholder="Enter Email"
                required
              />
            </div>
          </div>

          {invalidCredentials && (
            <small className="invalid-password_message">{errorMessage}</small>
          )}

          <button disabled={isLoading} className="login-btn">
            SUBMIT
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthForgotPassword;

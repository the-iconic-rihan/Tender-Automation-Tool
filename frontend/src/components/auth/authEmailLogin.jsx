import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import "../../assets/css/authEmailLogin.css";
import show from "../../assets/images/show.svg";
import hide from "../../assets/images/hide.svg";
import { addDivision, login } from "../../features/auth/authSlice";
import { getErrorToast } from "../../utils/useToast";
import { clearCookies } from "../../utils/clearCookies";

const AuthEmailLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [division, setDivision] = useState("");
  const [passwordType, setPasswordType] = useState("password");
  const [invalidCredentials, setInvalidCredentials] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);

  const inputTypingStyles = {
    background: username !== "" && "inherit",
    backgroundSize: username !== "" && "0",
    backgroundPosition: username !== "" && "0",
    textIndent: username !== "" && "0",
  };

  const passwordTypingStyles = {
    background: password !== "" && "inherit",
    backgroundSize: password !== "" && "0",
    backgroundPosition: password !== "" && "0",
    textIndent: password !== "" && "0",
  };

  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    const userData = new FormData();
    userData.append("username", username);
    userData.append("password", password);
    userData.append("division", division);

    setErrorMessage("");
    setInvalidCredentials(false);

    clearCookies();

    dispatch(login(userData))
      .unwrap()
      .then((user) => {
        const { username, access_token, refresh_token, session_key } = user;

        dispatch(addDivision(division));
        localStorage.setItem("username", username);
        localStorage.setItem("accessToken", access_token);
        localStorage.setItem("refreshToken", refresh_token);
        localStorage.setItem("division", division);
        localStorage.setItem("super_user", true);
        const cookie = `session_key=${session_key};path=/`;
        const user_cookie = `username = ${username};path=/`;

        document.cookie = cookie;
        document.cookie = user_cookie;

        if (user.first_time) {
          navigate("/auth/reset-password");
        } else {
          navigate("/page/dashboard");
        }
      })
      .catch((error) => {
        setErrorMessage(error);
        setInvalidCredentials(true);
      });
  };

  const togglePasswordHandler = () => {
    setPasswordType(passwordType === "password" ? "text" : "password");
  };

  return (
    <div className="login-container">
      <h3 className="login-heading">login</h3>

      <form className="form-container" onSubmit={submitHandler}>
        <div className="login-input-section" style={inputTypingStyles}>
          <label htmlFor="username" className="username-label">
            Username
          </label>
          <div
            className={`user-input-section  ${
              invalidCredentials ? "invalid-username" : ""
            }`}
          >
            <input
              type="text"
              id="username"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              className="user-input"
              placeholder="Enter Username"
              required
            />
          </div>
        </div>
        <div className="login-input-section" style={passwordTypingStyles}>
          <label htmlFor="password" className="password-label">
            Password
          </label>
          <div
            className={`
          user-input-section user-password-section ${
            invalidCredentials ? "invalid-password" : ""
          }`}
          >
            <input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className=" user-input user-password"
              type={passwordType}
              placeholder="Enter Password"
              required
            />
            <div className="password-icon">
              <img
                onClick={togglePasswordHandler}
                src={passwordType === "password" ? show : hide}
                alt="password-toggle"
              />
            </div>
          </div>
        </div>

        <div className="ael_division-container">
          <label
            htmlFor="div-select"
            className="ae_division-label username-label"
          >
            Profile
          </label>

          <select
            className={`ae_division-select-input ${
              invalidCredentials ? "invalid-username" : ""
            }`}
            name="division"
            id="div-select"
            onChange={(e) => setDivision(e.target.value)}
            required
          >
            <option value="">--Select Profile--</option>
            <option value="WWS_SPG">WWS_SPG</option>
            <option value="WWS_IPG">WWS_IPG</option>
            <option value="WWS_Services">WWS_Services</option>
          </select>
        </div>

        {invalidCredentials && (
          <small className="invalid-password_message">{errorMessage}</small>
        )}

        <div className="forgot-password-wrapper">
          <Link className="password-forgot_password" to="/auth/forgot-password">
            Forgot Password ?
          </Link>
        </div>

        <button disabled={isLoading} className="login-btn">
          LOGIN
        </button>
      </form>
    </div>
  );
};

export default AuthEmailLogin;

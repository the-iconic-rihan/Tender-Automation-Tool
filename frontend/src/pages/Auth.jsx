import React from "react";
import "../assets/css/Auth.css";
import { Outlet } from "react-router-dom";
import thermaxLogo from "../assets/images/thermax_logo.svg";
import dimensionlessLogo from "../assets/images/dimensionless_named_logo.svg";

const Auth = () => {
  return (
    <div className="page sign_in-page">
      <div className="auth_header-container">
        <div className="ah_text-container">
          <div className="ah_thermax-logo-container">
            <img src={thermaxLogo} alt="" />
            <p>
              CONSERVING RESOURCES <br />
              &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;PRESERVING THE
              FUTURE
            </p>
          </div>
          <div className="ah_dimensionless-logo-container">
            <img src={dimensionlessLogo} alt="" />
          </div>
        </div>
        <div className="ah_img-container"></div>
      </div>
      <div className="auth_content-container">
        <div className="auth_img-container"></div>
        <div className="auth_outlet-container">
          <div className="ao_bgc-container-1"></div>
          <div className="ao_bgc-container-2"></div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Auth;

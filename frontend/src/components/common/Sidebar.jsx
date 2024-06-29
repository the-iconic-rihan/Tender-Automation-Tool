import React from "react";
import { sidebarData, adminSidebarData } from "../../utils/SidebarData";

import thermaxLogo from "../../assets/images/thermax_logo.svg";

import { NavLink, useLocation } from "react-router-dom";
import "../../assets/css/Sidebar.css";
import { useSelector } from "react-redux";

const Sidebar = () => {
  const location = useLocation();

  const upload = useSelector((state) => state.upload);
  const user = useSelector((state) => state.auth);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div className="center sidebar-thermax-logo-container">
        <img src={thermaxLogo} alt="thermax" />
      </div>

      <ul>
        {(user.isAdmin ? adminSidebarData : sidebarData).map((item, index) => (
          <li key={index}>
            <NavLink
              style={({ isActive }) => ({
                backgroundColor: isActive ? "#186DAA14" : "#fff",
                color: isActive ? "#186daa" : "#515050",
                borderRight: isActive ? "3px solid #186daa" : "none",
                borderRadius: isActive ? "3px" : "none",
                cursor:
                  (item.title === "File List" &&
                    location.pathname.includes("dashboard")) ||
                  (item.title === "File List" && !upload.tenderNo) ||
                  (item.title === "File List" &&
                    location.pathname === "/page/tender-files") ||
                  (item.title === "File List" &&
                    location.pathname.includes("/page/upload/"))
                    ? "not-allowed"
                    : "pointer",
              })}
              to={item.link}
              className="sidebar-link-card"
              onClick={(e) => {
                const linkDisabled =
                  (item.title === "File List" &&
                    location.pathname.includes("dashboard")) ||
                  (item.title === "File List" && !upload.tenderNo) ||
                  (item.title === "File List" &&
                    location.pathname === "/page/tender-files") ||
                  (item.title === "File List" &&
                    location.pathname.includes("/page/upload/"));

                if (linkDisabled) {
                  e.preventDefault();
                }
              }}
              children={({ isActive }) => (
                <>
                  <img
                    src={isActive ? item.activeIcon : item.icon}
                    alt={item.title}
                  />
                  <p
                    style={{
                      fontWeight: isActive ? 500 : 400,
                    }}
                  >
                    {item.title}
                  </p>
                </>
              )}
            ></NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;

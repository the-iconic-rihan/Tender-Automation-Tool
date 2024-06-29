import React from "react";

const NextIcon = ({ disabled = false }) => {
  return (
    <svg
      width="20px"
      height="20px"
      viewBox="0 0 1.2 1.2"
      version="1"
      xmlns="http://www.w3.org/2000/svg"
      enableBackground="new 0 0 48 48"
    >
      <path
        fill={disabled ? "#C3D9E9" : "#186DAA"}
        points="17.1,5 14,8.1 29.9,24 14,39.9 17.1,43 36,24"
        d="M0.428 0.125L0.35 0.203L0.748 0.6L0.35 0.998L0.428 1.075L0.9 0.6Z"
      />
    </svg>

    // <svg
    //   width="29"
    //   height="20.714"
    //   viewBox="0 0 29 20.714"
    //   fill="none"
    //   xmlns="http://www.w3.org/2000/svg"
    // >
    //   <g clip-path="url(#clip0_0_773)">
    //     <path
    //       d="M9.529 3.48c-0.329 0.222 -0.514 0.522 -0.514 0.837 0 0.315 0.184 0.615 0.514 0.837l8.677 5.868 -8.679 5.866c-0.317 0.224 -0.495 0.522 -0.491 0.833 0.004 0.311 0.189 0.609 0.514 0.829 0.325 0.22 0.766 0.344 1.224 0.346 0.46 0.002 0.903 -0.116 1.233 -0.331l9.918 -6.705c0.327 -0.222 0.512 -0.524 0.512 -0.837 0 -0.315 -0.184 -0.617 -0.512 -0.839L12.006 3.478a2.245 2.245 0 0 0 -1.239 -0.346c-0.464 0 -0.911 0.124 -1.239 0.346Z"
    //       fill={disabled ? "#C3D9E9" : "#186DAA"}
    //     />
    //   </g>
    //   <defs>
    //     <clipPath id="clip0_0_773">
    //       <path
    //         width="13.54"
    //         height="9.15417"
    //         fill="white"
    //         transform="translate(.12 .743)"
    //         d="M0 0H28.047V18.962H0V0z"
    //       />
    //     </clipPath>
    //   </defs>
    // </svg>
  );
};

export default NextIcon;

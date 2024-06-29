import React from "react";
import { Link } from "react-router-dom";

import "src/assets/css/notFound.css";

const NotFound = () => {
  return (
    <div className="page">
      <div className="error-container center">
        <h1>400</h1>
        <h3>Looks like you're lost</h3>
        <p>The page you are looking for is not avaible!</p>

        <div className="error-btn-container">
          <Link to="/">Return to the home page</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

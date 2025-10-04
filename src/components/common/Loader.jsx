import React from "react";
import PropTypes from "prop-types";
import "bootstrap/dist/css/bootstrap.min.css";

const Loader = ({ variant = "full", size = "md", message }) => {
  const sizeMap = {
    sm: "spinner-border-sm",
    md: "",
    lg: "spinner-border-lg",
  };

  if (variant === "inline") {
    return (
      <div className="d-flex align-items-center">
        <div className={`spinner-border text-primary ${sizeMap[size]}`} role="status" />
        {message && <span className="ms-2">{message}</span>}
      </div>
    );
  }

  // full-page loader
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className={`spinner-border text-primary ${sizeMap[size]}`} role="status" />
      {message && <span className="ms-2">{message}</span>}
    </div>
  );
};

Loader.propTypes = {
  variant: PropTypes.oneOf(["full", "inline"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  message: PropTypes.string,
};

export default Loader;

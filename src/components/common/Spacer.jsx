import React from "react";
import PropTypes from "prop-types";

const Spacer = ({ size = "md", direction = "vertical" }) => {
  const sizeMap = {
    sm: 8,
    md: 16,
    lg: 32,
  };

  const style =
    direction === "vertical"
      ? { height: sizeMap[size] }
      : { width: sizeMap[size] };

  return <div style={style} />;
};

Spacer.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  direction: PropTypes.oneOf(["vertical", "horizontal"]),
};

export default Spacer;

import React from "react";
import PropTypes from "prop-types";
import "bootstrap/dist/css/bootstrap.min.css";

const SectionTitle = ({ children, level = 2, align = "center" }) => {
  const Heading = `h${level}`; // dynamic heading tag

  const alignClass = {
    start: "text-start",
    center: "text-center",
    end: "text-end",
  }[align];

  return (
    <div className={`my-4 ${alignClass}`}>
      <Heading className="fw-bold text-dark">{children}</Heading>
    </div>
  );
};

SectionTitle.propTypes = {
  children: PropTypes.node.isRequired,
  level: PropTypes.oneOf([2, 3]), // only H2 & H3
  align: PropTypes.oneOf(["start", "center", "end"]),
};

export default SectionTitle;


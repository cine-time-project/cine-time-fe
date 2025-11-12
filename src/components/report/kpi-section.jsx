// src/components/report/kpi-section.jsx
import React from "react";
import PropTypes from "prop-types";

const KpiSection = ({ data = [] }) => {
  return (
    <div className="container-fluid mb-4">
      {/* row-cols-* sınıflarıyla responsive sütun sayısı ayarlandı */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-4">
        {data.map((item, index) => (
          <div key={index} className="col">
            <div className="card shadow-sm border-0 h-100 text-center py-3 px-2">
              <div className="card-body d-flex flex-column justify-content-center align-items-center">
                <div className="d-flex flex-column align-items-center">
                  <div style={{ fontSize: "1.8rem", marginBottom: "0.3rem" }}>
                    {item.icon}
                  </div>
                  <h6 className="text-muted mb-2">{item.title}</h6>
                  <h4 className="fw-bold mb-0">{item.value}</h4>
                  {item.change && (
                    <small
                      className={
                        item.change.startsWith("+")
                          ? "text-success fw-semibold"
                          : "text-danger fw-semibold"
                      }
                    >
                      {item.change}
                    </small>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

KpiSection.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      change: PropTypes.string,
      icon: PropTypes.string,
    })
  ),
};

export default KpiSection;

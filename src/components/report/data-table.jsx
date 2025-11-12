// src/components/report/data-table.jsx
import React from "react";
import PropTypes from "prop-types";
import SectionTitle from "../common/SectionTitle";

const DataTable = ({ data = [] }) => {
  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <SectionTitle title="Film Performance Report" />
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th scope="col">#</th>
                <th scope="col">Film Title</th>
                <th scope="col">Ticket Sales</th>
                <th scope="col">Revenue</th>
                <th scope="col">Avg. Rating</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((film, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td className="fw-semibold">{film.title}</td>
                    <td>{film.tickets.toLocaleString()}</td>
                    <td>{film.revenue}</td>
                    <td>
                      <span className="text-warning fw-bold">
                        ⭐ {film.rating.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-3">
                    No film data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

DataTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      tickets: PropTypes.number.isRequired,
      revenue: PropTypes.string.isRequired,
      rating: PropTypes.number.isRequired,
    })
  ),
};

export default DataTable;

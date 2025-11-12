// src/components/report/category-charts.jsx
import React from "react";
import PropTypes from "prop-types";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import SectionTitle from "../common/SectionTitle";

const COLORS = ["#007bff", "#28a745", "#ffc107", "#dc3545", "#6c757d"];

const CategoryCharts = ({ genreData, citySales }) => {
  return (
    <div className="row g-3">
      {/* Pie Chart - Film Genre Distribution */}
      <div className="col-12 col-lg-6">
        <div className="card shadow-sm border-0 h-100">
          <div className="card-body">
            <SectionTitle title="Film Genre Distribution" />
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={genreData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {genreData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart - Top Cities by Ticket Sales */}
      <div className="col-12 col-lg-6">
        <div className="card shadow-sm border-0 h-100">
          <div className="card-body">
            <SectionTitle title="Top Cities by Ticket Sales" />
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart
                  data={citySales}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="city" />
                  <Tooltip />
                  <Bar dataKey="tickets" fill="#007bff" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

CategoryCharts.propTypes = {
  genreData: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.number,
    })
  ),
  citySales: PropTypes.arrayOf(
    PropTypes.shape({
      city: PropTypes.string,
      tickets: PropTypes.number,
    })
  ),
};

export default CategoryCharts;

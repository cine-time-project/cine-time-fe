// src/components/report/trend-chart.jsx
import React from "react";
import PropTypes from "prop-types";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import SectionTitle from "../common/SectionTitle";

const TrendChart = ({ data }) => {
  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body">
        <SectionTitle title="Sales and Revenue Over Time" />
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="tickets"
                name="Ticket Sales"
                stroke="#007bff"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#28a745"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

TrendChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string,
      tickets: PropTypes.number,
      revenue: PropTypes.number,
    })
  ),
};

export default TrendChart;

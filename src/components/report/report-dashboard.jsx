"use client";
import React, { useState } from "react";
import KpiSection from "./kpi-section";
import TrendChart from "./trend-chart";
import CategoryCharts from "./category-charts";
import DataTable from "./data-table";
import SectionTitle from "../common/SectionTitle";
import Spacer from "../common/Spacer";
import {
  kpiData as baseKpi,
  trendData as baseTrend,
  citySales as baseCity,
  genreDistribution as baseGenre,
  filmPerformance as baseFilms,
} from "../../helpers/data/reportData";

const ReportDashboard = () => {
  const [filter, setFilter] = useState("month");
  const [data, setData] = useState({
    kpi: baseKpi,
    trend: baseTrend,
    city: baseCity,
    genre: baseGenre,
    films: baseFilms,
  });

  const handleFilterChange = (value) => {
    setFilter(value);
    let multiplier = 1;
    if (value === "week") multiplier = 0.3;
    else if (value === "year") multiplier = 2;

    const updatedKpi = baseKpi.map((kpi) => ({
      ...kpi,
      value:
        typeof kpi.value === "number"
          ? Math.round(kpi.value * multiplier)
          : kpi.value,
    }));

    const updatedTrend = baseTrend.map((t) => ({
      ...t,
      tickets: Math.round(t.tickets * multiplier),
      revenue: Math.round(t.revenue * multiplier),
    }));

    const updatedCity = baseCity.map((c) => ({
      ...c,
      tickets: Math.round(c.tickets * multiplier),
    }));

    const updatedFilms = baseFilms.map((f) => ({
      ...f,
      tickets: Math.round(f.tickets * multiplier),
    }));

    setData({
      kpi: updatedKpi,
      trend: updatedTrend,
      city: updatedCity,
      genre: baseGenre,
      films: updatedFilms,
    });
  };

  return (
    <div className="container-fluid py-4 px-3">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <SectionTitle title="🎬 CinemaTime Reports" />

        {/* Filter Area */}
        <div className="d-flex align-items-center gap-2">
          <select
            className="form-select form-select-sm"
            style={{ width: "160px" }}
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="week">Last 7 Days</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => handleFilterChange(filter)}
          >
            Apply
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <KpiSection data={data.kpi} />
      <Spacer size={20} />

      {/* Charts */}
      <div className="row g-4">
        <div className="col-12">
          <TrendChart data={data.trend} />
        </div>
        <div className="col-12">
          <CategoryCharts citySales={data.city} genreData={data.genre} />
        </div>
      </div>

      <Spacer size={20} />

      {/* Data Table */}
      <DataTable data={data.films} />
    </div>
  );
};

export default ReportDashboard;

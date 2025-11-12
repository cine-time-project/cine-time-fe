// src/app/(admin)/admin/reports/page.jsx
"use client";

import React from "react";
import ReportDashboard from "@/components/report/report-dashboard";
import SectionTitle from "@/components/common/SectionTitle";
import Spacer from "@/components/common/Spacer";

const ReportsPage = () => {
  return (
    <div className="container-fluid py-4">
      <SectionTitle title="Reports" />
      <Spacer size={10} />
      <ReportDashboard />
    </div>
  );
};

export default ReportsPage;

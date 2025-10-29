"use client";

import React, { useEffect, useState } from "react";
import AdminTable from "@/components/admin/AdminTable";

export default function CountriesPage() {
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    // mock data for now
    setCountries([
      { id: 1, name: "Türkiye" },
      { id: 2, name: "United States" },
      { id: 3, name: "Germany" },
    ]);
  }, []);

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Country Name" },
  ];

  return (
    <div className="p-6 text-gray-100 flex flex-col gap-6">
      {/* Data Table Card */}
      <div className="bg-[#0f0f12]/80 border border-[#2a2a38] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
        <AdminTable columns={columns} rows={countries} />
      </div>
    </div>
  );
}

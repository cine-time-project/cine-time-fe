"use client";

import React, { useEffect, useState } from "react";
import AdminTable from "@/components/admin/AdminTable";

export default function DistrictsPage() {
  const [districtRows, setDistrictRows] = useState([]);

  useEffect(() => {
    // Backend will likely send something like:
    // {
    //   id,
    //   name,
    //   city: { id, name, country: { id, name } }
    // }
    const mockFromApi = [
      {
        id: 100,
        name: "Kadıköy",
        city: {
          id: 10,
          name: "Istanbul",
          country: { id: 1, name: "Türkiye" },
        },
      },
      {
        id: 101,
        name: "Downtown",
        city: {
          id: 11,
          name: "Miami",
          country: { id: 2, name: "United States" },
        },
      },
    ];

    // flatten for table
    setDistrictRows(
      mockFromApi.map((d) => ({
        id: d.id,
        name: d.name,
        cityName: d.city?.name,
        countryName: d.city?.country?.name,
      }))
    );
  }, []);

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "District" },
    { key: "cityName", label: "City" },
    { key: "countryName", label: "Country" },
  ];

  return (
    <div className="p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Districts</h1>
          <p className="text-sm text-gray-400">
            Manage districts and assign them to cities.
          </p>
        </div>

        <button
          className="bg-yellow-500 text-black font-medium px-4 py-2 rounded-md hover:opacity-90"
          onClick={() => {
            alert("open add-district modal");
          }}
        >
          + Add District
        </button>
      </div>

      <AdminTable columns={columns} rows={districtRows} />
    </div>
  );
}

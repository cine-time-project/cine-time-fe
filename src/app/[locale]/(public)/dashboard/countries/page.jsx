"use client";

import React, { useEffect, useState } from "react";
import AdminTable from "@/components/admin/AdminTable";
import axios from "axios";
import { authHeaders } from "@/lib/utils/http";
import {
  COUNTRY_LIST_API,
  COUNTRY_ADD_API,
  COUNTRY_DELETE_API,
  COUNTRY_EDIT_API,
} from "@/helpers/api-routes.js";
import {
  listCountries,
  addCountry,
  updateCountry,
  deleteCountry,
} from "@/action/country-actions";

export default function CountriesPage() {
  const [countries, setCountries] = useState([]);

  // Fetch countries from backend
  const fetchCountries = async () => {
    try {
      const data = await listCountries();
      setCountries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load countries:", err);
    }
  };

  const handleAdd = async (payload) => {
    try {
      await addCountry({ name: String(payload?.name || "").trim() });
      await fetchCountries();
      return { ok: true };
    } catch (err) {
      const backendMsg = err?.response?.data?.message || err?.response?.data?.error;
      return { ok: false, message: backendMsg || "Failed to add country" };
    }
  };

  const handleEdit = async (payload) => {
    try {
      await updateCountry({ id: payload?.id, name: String(payload?.name || "").trim() });
      await fetchCountries();
      return { ok: true };
    } catch (err) {
      const backendMsg = err?.response?.data?.message || err?.response?.data?.error;
      return { ok: false, message: backendMsg || "Failed to update country" };
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCountry(id);
      await fetchCountries();
      return { ok: true };
    } catch (err) {
      const backendMsg = err?.response?.data?.message || err?.response?.data?.error;
      return { ok: false, message: backendMsg || "Failed to delete country" };
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Country Name" },
  ];

  return (
    <div className="p-6 text-gray-100 flex flex-col gap-6">
      <div className="bg-[#0f0f12]/80 border border-[#2a2a38] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
        <AdminTable
          columns={columns}
          rows={countries}
          onRefresh={fetchCountries}
          // legacy endpoint props (stay, in case AdminTable still uses them)
          addEndpoint={COUNTRY_ADD_API}
          editEndpoint={COUNTRY_EDIT_API}
          deleteEndpoint={COUNTRY_DELETE_API}
          // new action callbacks (preferred)
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

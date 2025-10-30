"use client";

import React, { useEffect, useState } from "react";
import { authHeaders } from "@/lib/utils/http";
import axios from "axios";

export default function CountriesDashboard() {
  const [countries, setCountries] = useState([]);
  const [newCountryName, setNewCountryName] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editCountryId, setEditCountryId] = useState(null);
  const [editCountryName, setEditCountryName] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackType, setFeedbackType] = useState(""); // "error" or "success"

  const fetchCountries = async () => {
    try {
      const response = await axios.get("http://localhost:8090/api/countries", {
        headers: authHeaders(),
      });
      setCountries(response.data);
    } catch (err) {
      console.error("Failed to load countries:", err);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const handleAddCountry = async () => {
    if (!newCountryName.trim()) return;
    try {
      await axios.post(
        "http://localhost:8090/api/countries/add",
        { name: newCountryName.trim() },
        { headers: authHeaders() }
      );
      setFeedbackMsg("Country added successfully.");
      setFeedbackType("success");
      setNewCountryName("");
      await fetchCountries();
    } catch (err) {
      console.error("Failed to add country:", err);
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to add country.";
      setFeedbackMsg(backendMsg);
      setFeedbackType("error");
    }
  };

  const openEditModal = (country) => {
    setEditCountryId(country.id);
    setEditCountryName(country.name || "");
    setIsEditOpen(true);
  };

  const handleDeleteCountry = async (id) => {
    if (!window.confirm("Are you sure you want to delete this country?")) return;
    try {
      await axios.delete(`http://localhost:8090/api/countries/delete/${id}`, {
        headers: authHeaders(),
      });
      setFeedbackMsg("Country deleted.");
      setFeedbackType("success");
      await fetchCountries();
    } catch (err) {
      console.error("Failed to delete country:", err);
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to delete country.";
      setFeedbackMsg(backendMsg);
      setFeedbackType("error");
    }
  };

  const handleUpdateCountry = async () => {
    if (!editCountryId || !editCountryName.trim()) return;
    try {
      await axios.put(
        `http://localhost:8090/api/countries/update/${editCountryId}`,
        { name: editCountryName.trim() },
        { headers: authHeaders() }
      );
      setIsEditOpen(false);
      setEditCountryId(null);
      setEditCountryName("");
      setFeedbackMsg("Country updated.");
      setFeedbackType("success");
      await fetchCountries();
    } catch (err) {
      console.error("Failed to update country:", err);
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to update country.";
      setFeedbackMsg(backendMsg);
      setFeedbackType("error");
    }
  };

  return (
    <div>
      <h1>Countries</h1>
      {feedbackMsg && (
        <div
          className={[
            "mt-3 mb-4 text-xs px-3 py-2 rounded-md border",
            feedbackType === "error"
              ? "bg-red-900/40 border-red-500 text-red-300"
              : "bg-green-900/30 border-green-500 text-green-300",
          ].join(" ")}
        >
          {feedbackMsg}
        </div>
      )}
      <div className="mt-4 flex flex-col md:flex-row items-center gap-3">
        <input
          type="text"
          value={newCountryName}
          onChange={(e) => setNewCountryName(e.target.value)}
          placeholder="Enter country name"
          className="bg-[#0f0f12] text-gray-100 border border-[#2a2a38] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 w-full md:w-auto"
        />
        <button
          onClick={handleAddCountry}
          className="bg-yellow-500 hover:brightness-110 active:scale-[0.98] text-black font-semibold text-sm px-4 py-2 rounded-md transition-all"
        >
          + Add Country
        </button>
      </div>
      <ul>
        {countries.map((country) => (
          <li
            key={country.id}
            className="text-lg font-medium text-gray-100 mb-2 flex items-center justify-between"
          >
            <span>{country.name}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openEditModal(country)}
                className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs px-2 py-[2px] rounded-md transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteCountry(country.id)}
                className="bg-yellow-500 hover:bg-yellow-400 text-black text-xs px-2 py-[2px] rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-[#2a2a38] rounded-xl p-6 w-[90%] max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-gray-100">
            <h2 className="text-lg font-semibold mb-4">Update Country</h2>

            <label className="text-sm text-gray-300 font-medium block mb-2">
              Country Name
            </label>
            <input
              value={editCountryName}
              onChange={(e) => setEditCountryName(e.target.value)}
              className="bg-[#0f0f12] text-gray-100 border border-[#2a2a38] rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-4"
              placeholder="Enter country name"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setEditCountryId(null);
                  setEditCountryName("");
                }}
                className="text-xs px-3 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdateCountry}
                className="text-xs px-3 py-2 rounded-md bg-yellow-500 hover:bg-yellow-400 text-black font-semibold transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

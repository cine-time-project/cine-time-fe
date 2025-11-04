"use client";

import React, { useEffect, useState } from "react";
import {
  listAllCities,
  groupCitiesByCountry,
  listCountries,
  addCity,
  updateCity,
  deleteCity,
  addCountry,
} from "@/action/city-actions";

export default function CitiesPage() {
  const [countriesMap, setCountriesMap] = useState({}); // { countryName: [{id,name}, ...] }
  const [newCityName, setNewCityName] = useState("");
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [countryOptions, setCountryOptions] = useState([]); // from /countries
  const [selectedViewCountryId, setSelectedViewCountryId] = useState(""); // which country's cities to show
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackType, setFeedbackType] = useState(""); // "error" | "success"
  const [newCountryName, setNewCountryName] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editCityId, setEditCityId] = useState(null);
  const [editCityName, setEditCityName] = useState("");
  const [editCityCountryId, setEditCityCountryId] = useState("");

  // open edit modal for a specific city
  const openEditModal = (city) => {
    // city here is { id, name }
    setEditCityId(city.id);
    setEditCityName(city.name);

    // We need to know which country this city belongs to.
    // We can infer it from selectedViewCountryId because the city
    // is being rendered under that country's section.
    setEditCityCountryId(String(selectedViewCountryId || ""));

    setIsEditOpen(true);
  };

  const handleUpdateCity = async () => {
    if (!editCityId || !editCityName.trim() || !editCityCountryId) return;
    try {
      await updateCity({
        id: editCityId,
        name: editCityName.trim(),
        countryId: Number(editCityCountryId),
      });

      setFeedbackMsg("City updated.");
      setFeedbackType("success");

      setIsEditOpen(false);
      setEditCityId(null);
      setEditCityName("");
      setEditCityCountryId("");

      await fetchCities();
      await fetchCountries();
    } catch (err) {
      console.error("Failed to update city:");
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to update city.";
      setFeedbackMsg(backendMsg);
      setFeedbackType("error");
    }
  };

  // fetch cities for listing and grouping
  const fetchCities = async () => {
    try {
      const list = await listAllCities();
      setCountriesMap(groupCitiesByCountry(list));
    } catch (err) {
      console.error("Failed to load cities:", err);
    }
  };

  // fetch countries for dropdowns
  const fetchCountries = async () => {
    try {
      const list = await listCountries();
      setCountryOptions(list);

      if (!selectedViewCountryId && list.length > 0) {
        setSelectedViewCountryId(String(list[0].id));
      }
    } catch (err) {
      console.error("Failed to load countries:", err);
    }
  };

  // add city
  const handleAddCity = async () => {
    if (!selectedCountryId || !newCityName.trim()) return;
    try {
      await addCity({
        name: newCityName.trim(),
        countryId: Number(selectedCountryId),
      });

      setFeedbackMsg("City added successfully.");
      setFeedbackType("success");

      setNewCityName("");
      setSelectedCountryId("");

      await fetchCities();
    } catch (err) {
      console.error("Failed to add city:", err);
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to add city.";
      setFeedbackMsg(backendMsg);
      setFeedbackType("error");
    }
  };

  // delete city
  const handleDeleteCity = async (id) => {
    if (!window.confirm("Are you sure you want to delete this city?")) return;
    try {
      await deleteCity(id);

      setFeedbackMsg("City deleted.");
      setFeedbackType("success");

      await fetchCities();
    } catch (err) {
      console.error("Failed to delete city:", err);
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to delete city.";
      setFeedbackMsg(backendMsg);
      setFeedbackType("error");
    }
  };

  // add country
  const handleAddCountry = async () => {
    if (!newCountryName.trim()) return;
    try {
      await addCountry({ name: newCountryName.trim() });

      setFeedbackMsg("Country added successfully.");
      setFeedbackType("success");

      setNewCountryName("");

      await fetchCities();
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

  useEffect(() => {
    fetchCountries();
    fetchCities();
  }, []);

  const canAddCity = Boolean(selectedCountryId) && Boolean(newCityName.trim());

  return (
    <div className="p-6 text-white flex flex-col gap-6">
      {/* Header and Add City form */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Cities</h1>
          <p className="text-sm text-gray-400">
            Add cities and assign them to countries.
          </p>
        </div>

        {feedbackMsg && (
          <div
            className={[
              "text-xs px-3 py-2 rounded-md border max-w-sm",
              feedbackType === "error"
                ? "bg-red-900/40 border-red-500 text-red-300"
                : "bg-green-900/30 border-green-500 text-green-300",
            ].join(" ")}
          >
            {feedbackMsg}
          </div>
        )}

        {/* Add Country inline form */}
        <div className="flex flex-row flex-wrap items-end gap-3 max-w-xl bg-[#10121a] border border-[#2a2a38] rounded-md p-4">
          <label className="text-xs text-gray-300 font-medium whitespace-nowrap">
            New Country
          </label>

          <input
            value={newCountryName}
            onChange={(e) => setNewCountryName(e.target.value)}
            placeholder="Enter country name"
            className="bg-[#0f0f12] text-gray-100 border border-[#2a2a38] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />

          <button
            disabled={!newCountryName.trim()}
            onClick={handleAddCountry}
            className={[
              "bg-yellow-500 hover:brightness-110 active:scale-[0.98] text-black font-semibold text-sm px-4 py-2 rounded-md transition-all",
              !newCountryName.trim()
                ? "opacity-40 pointer-events-none cursor-not-allowed"
                : "",
            ].join(" ")}
          >
            + Add Country
          </button>
        </div>

        {/* form row */}
        <div className="flex flex-row flex-wrap items-end gap-3 max-w-xl">
          <label className="text-xs text-gray-300 font-medium whitespace-nowrap">
            Country (required)
          </label>
          <select
            value={selectedCountryId}
            onChange={(e) => {
              setSelectedCountryId(e.target.value);
              setSelectedViewCountryId(e.target.value);
            }}
            className="bg-[#0f0f12] text-gray-100 border border-[#2a2a38] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="">Select a country...</option>
            {countryOptions.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>

          <label className="text-xs text-gray-300 font-medium whitespace-nowrap">
            City name
          </label>
          <input
            value={newCityName}
            onChange={(e) => setNewCityName(e.target.value)}
            placeholder={
              selectedCountryId ? "Enter city name" : "Select a country first"
            }
            disabled={!selectedCountryId}
            className={[
              "bg-[#0f0f12] text-gray-100 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2",
              !selectedCountryId
                ? "border-[#3a3a3a] text-gray-500 cursor-not-allowed opacity-40"
                : "border-[#2a2a38] focus:ring-yellow-500",
            ].join(" ")}
          />

          <button
            disabled={!canAddCity}
            onClick={handleAddCity}
            className={[
              "bg-yellow-500 hover:brightness-110 active:scale-[0.98] text-black font-semibold text-sm px-4 py-2 rounded-md transition-all",
              !canAddCity
                ? "opacity-40 pointer-events-none cursor-not-allowed"
                : "",
            ].join(" ")}
          >
            + Add City
          </button>
        </div>
      </div>

      {/* City list filtered by country */}
      <div className="max-w-xl flex flex-col gap-4">
        {/* Country filter dropdown for viewing cities */}
        <div className="flex flex-col gap-1 w-full max-w-xs">
          <label className="text-xs text-gray-300 font-medium">
            View cities for country
          </label>
          <select
            value={selectedViewCountryId}
            onChange={(e) => setSelectedViewCountryId(e.target.value)}
            className="bg-[#0f0f12] text-gray-100 border border-[#2a2a38] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            {countryOptions.length === 0 && (
              <option value="">No countries</option>
            )}
            {countryOptions.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        {/* Cities for selected country */}
        <div>
          {(!selectedViewCountryId ||
            Object.keys(countriesMap).length === 0) && (
            <div className="px-3 py-6 text-center text-xs text-gray-500 border border-[#2a2a38] rounded-md bg-[#10121a]">
              No cities.
            </div>
          )}

          {selectedViewCountryId &&
            (() => {
              // find the country name that matches selectedViewCountryId
              const selectedCountryName = countryOptions.find(
                (c) => String(c.id) === String(selectedViewCountryId)
              )?.name;

              if (!selectedCountryName || !countriesMap[selectedCountryName]) {
                return (
                  <div className="px-3 py-6 text-center text-xs text-gray-500 border border-[#2a2a38] rounded-md bg-[#10121a]">
                    No cities for this country.
                  </div>
                );
              }

              const cityList = countriesMap[selectedCountryName];

              return (
                <div className="border border-[#2a2a38] rounded-md overflow-hidden bg-[#10121a]">
                  {/* Country header */}
                  <div className="bg-[#1a1f2e] text-gray-200 text-sm font-semibold px-3 py-2 border-b border-[#2a2a38]">
                    {selectedCountryName}
                  </div>

                  {/* Cities under that country */}
                  <ul className="divide-y divide-[#2a2a38]">
                    {cityList.map((city) => (
                      <li
                        key={city.id}
                        className="flex items-center justify-between px-3 py-2 text-sm text-gray-100"
                      >
                        <span className="font-medium text-base">
                          {city.name}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            className="bg-yellow-500 hover:bg-yellow-400 text-black text-[11px] px-2 py-[2px] rounded-md transition-colors"
                            onClick={() => openEditModal(city)}
                          >
                            Edit
                          </button>
                          <button
                            className="bg-yellow-500 hover:bg-yellow-400 text-black text-[11px] px-2 py-[2px] rounded-md transition-colors"
                            onClick={() => handleDeleteCity(city.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}

                    {cityList.length === 0 && (
                      <li className="px-3 py-6 text-center text-xs text-gray-500">
                        No cities.
                      </li>
                    )}
                  </ul>
                </div>
              );
            })()}
        </div>
      </div>
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-[#2a2a38] rounded-xl p-6 w-[90%] max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-gray-100">
            <h2 className="text-lg font-semibold mb-4">Update City</h2>

            {/* City name field */}
            <label className="text-sm text-gray-300 font-medium block mb-2">
              City Name
            </label>
            <input
              value={editCityName}
              onChange={(e) => setEditCityName(e.target.value)}
              className="bg-[#0f0f12] text-gray-100 border border-[#2a2a38] rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-4"
              placeholder="Enter city name"
            />

            {/* Country select field */}
            <label className="text-sm text-gray-300 font-medium block mb-2">
              Country
            </label>
            <select
              value={editCityCountryId}
              onChange={(e) => setEditCityCountryId(e.target.value)}
              className="bg-[#0f0f12] text-gray-100 border border-[#2a2a38] rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-6"
            >
              <option value="">Select a country...</option>
              {countryOptions.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setEditCityId(null);
                  setEditCityName("");
                  setEditCityCountryId("");
                }}
                className="text-xs px-3 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdateCity}
                disabled={!(editCityName.trim() && editCityCountryId)}
                className={[
                  "text-xs px-3 py-2 rounded-md bg-yellow-500 hover:bg-yellow-400 text-black font-semibold transition-colors",
                  !(editCityName.trim() && editCityCountryId)
                    ? "opacity-40 pointer-events-none cursor-not-allowed"
                    : "",
                ].join(" ")}
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

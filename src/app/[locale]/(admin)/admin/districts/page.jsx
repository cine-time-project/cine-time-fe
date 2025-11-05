"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  listDistricts,
  addDistrict,
  updateDistrict,
  deleteDistrict,
  listCities,
  getCityWithDistricts,
} from "@/action/district-actions";

export default function DistrictsPage() {
  const [districts, setDistricts] = useState([]); // normalized rows: {id,name,cityId}
  const [cityOptions, setCityOptions] = useState([]); // [{id,name}]

  // add form
  const [newDistrictName, setNewDistrictName] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");

  // view filter
  const [viewCityId, setViewCityId] = useState("");

  // edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCityId, setEditCityId] = useState("");

  // feedback
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackType, setFeedbackType] = useState(""); // "error" | "success"

  const bootstrap = async () => {
    try {
      const [cities] = await Promise.all([listCities()]);
      setCityOptions(Array.isArray(cities) ? cities : []);
      if (!viewCityId && cities?.length) setViewCityId(String(cities[0].id));
    } catch (e) {
      console.error("Init load failed", e);
    }
  };

  useEffect(() => {
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load districts whenever viewCityId changes (via CITY_WITH_ITS_DISTRICT)
  useEffect(() => {
    const run = async () => {
      if (!viewCityId) {
        setDistricts([]);
        return;
      }
      try {
        const city = await getCityWithDistricts(viewCityId);
        const list = Array.isArray(city?.districtMiniResponses)
          ? city.districtMiniResponses
          : [];

        setDistricts(
          list.map((d) => ({
            id: d.id,
            name: d.name,
            cityId: city.id,
          }))
        );
      } catch (e) {
        console.error("Failed to load districts for city", e);
        setDistricts([]);
      }
    };
    run();
  }, [viewCityId]);

  const openEdit = (row) => {
    setEditId(row.id);
    setEditName(row.name || "");
    setEditCityId(String(row.cityId || viewCityId || ""));
    setIsEditOpen(true);
  };

  const handleAdd = async () => {
    if (!selectedCityId || !newDistrictName.trim()) return;
    try {
      await addDistrict({
        name: newDistrictName.trim(),
        cityId: Number(selectedCityId),
      });
      setFeedbackMsg("District added successfully.");
      setFeedbackType("success");
      setNewDistrictName("");
      setSelectedCityId("");

      // refresh view list
      const city = await getCityWithDistricts(viewCityId || selectedCityId);
      const list = Array.isArray(city?.districtMiniResponses)
        ? city.districtMiniResponses
        : [];
      setDistricts(
        list.map((d) => ({ id: d.id, name: d.name, cityId: city.id }))
      );
    } catch (err) {
      console.error("Failed to add district", err);
      const backendMsg =
        err?.response?.data?.message || err?.response?.data?.error;
      setFeedbackMsg(backendMsg || "Failed to add district.");
      setFeedbackType("error");
    }
  };

  const handleUpdate = async () => {
    if (!editId || !editName.trim() || !editCityId) return;
    try {
      await updateDistrict({
        id: editId,
        name: editName.trim(),
        cityId: Number(editCityId),
      });
      setFeedbackMsg("District updated.");
      setFeedbackType("success");
      setIsEditOpen(false);
      setEditId(null);
      setEditName("");
      setEditCityId("");

      const city = await getCityWithDistricts(viewCityId);
      const list = Array.isArray(city?.districtMiniResponses)
        ? city.districtMiniResponses
        : [];
      setDistricts(
        list.map((d) => ({ id: d.id, name: d.name, cityId: city.id }))
      );
    } catch (err) {
      console.error("Failed to update district", err);
      const backendMsg =
        err?.response?.data?.message || err?.response?.data?.error;
      setFeedbackMsg(backendMsg || "Failed to update district.");
      setFeedbackType("error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this district?"))
      return;
    try {
      await deleteDistrict(id);
      setFeedbackMsg("District deleted.");
      setFeedbackType("success");

      const city = await getCityWithDistricts(viewCityId);
      const list = Array.isArray(city?.districtMiniResponses)
        ? city.districtMiniResponses
        : [];
      setDistricts(
        list.map((d) => ({ id: d.id, name: d.name, cityId: city.id }))
      );
    } catch (err) {
      console.error("Failed to delete district", err);
      const backendMsg =
        err?.response?.data?.message || err?.response?.data?.error;
      setFeedbackMsg(backendMsg || "Failed to delete district.");
      setFeedbackType("error");
    }
  };

  const filtered = useMemo(() => {
    if (!viewCityId) return [];
    const vid = String(viewCityId);
    return districts.filter((d) => String(d.cityId) === vid);
  }, [districts, viewCityId]);

  const canAdd = Boolean(selectedCityId) && Boolean(newDistrictName.trim());

  return (
    <div className="p-6 text-white flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Districts</h1>
        <p className="text-sm text-gray-400">
          Manage districts and assign them to cities.
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

      {/* Add District */}
      <div className="flex flex-row flex-wrap items-end gap-3 max-w-xl bg-[#10121a] border border-[#2a2a38] rounded-md p-4">
        <label className="text-xs text-gray-300 font-medium whitespace-nowrap">
          City (required)
        </label>
        <select
          value={selectedCityId}
          onChange={(e) => setSelectedCityId(e.target.value)}
          className="bg-[#0f0f12] text-gray-100 border border-[#2a2a38] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          <option value="">Select a city...</option>
          {cityOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <label className="text-xs text-gray-300 font-medium whitespace-nowrap">
          District name
        </label>
        <input
          value={newDistrictName}
          onChange={(e) => setNewDistrictName(e.target.value)}
          placeholder={
            selectedCityId ? "Enter district name" : "Select a city first"
          }
          disabled={!selectedCityId}
          className={[
            "bg-[#0f0f12] text-gray-100 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2",
            !selectedCityId
              ? "border-[#3a3a3a] text-gray-500 cursor-not-allowed opacity-40"
              : "border-[#2a2a38] focus:ring-yellow-500",
          ].join(" ")}
        />

        <button
          disabled={!canAdd}
          onClick={handleAdd}
          className={[
            "bg-yellow-500 hover:brightness-110 active:scale-[0.98] text-black font-semibold text-sm px-4 py-2 rounded-md transition-all",
            !canAdd ? "opacity-40 pointer-events-none cursor-not-allowed" : "",
          ].join(" ")}
        >
          + Add District
        </button>
      </div>

      {/* View/filter by City */}
      <div className="flex flex-col gap-1 w-full max-w-xs">
        <label className="text-xs text-gray-300 font-medium">
          View districts for city
        </label>
        <select
          value={viewCityId}
          onChange={(e) => setViewCityId(e.target.value)}
          className="bg-[#0f0f12] text-gray-100 border border-[#2a2a38] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          {cityOptions.length === 0 && <option value="">No cities</option>}
          {cityOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* District list for selected city */}
      <div className="border border-[#2a2a38] rounded-md overflow-hidden bg-[#10121a] max-w-xl">
        <div className="bg-[#1a1f2e] text-gray-200 text-sm font-semibold px-3 py-2 border-b border-[#2a2a38]">
          {cityOptions.find((c) => String(c.id) === String(viewCityId))?.name ||
            "No city selected"}
        </div>
        <ul className="divide-y divide-[#2a2a38]">
          {filtered.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between px-3 py-2 text-sm text-gray-100"
            >
              <span className="font-medium text-base">{d.name}</span>
              <div className="flex items-center gap-2">
                <button
                  className="bg-yellow-500 hover:bg-yellow-400 text-black text-[11px] px-2 py-[2px] rounded-md transition-colors"
                  onClick={() => openEdit(d)}
                >
                  Edit
                </button>
                <button
                  className="bg-yellow-500 hover:bg-yellow-400 text-black text-[11px] px-2 py-[2px] rounded-md transition-colors"
                  onClick={() => handleDelete(d.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}

          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center text-xs text-gray-500">
              No districts.
            </li>
          )}
        </ul>
      </div>

      {/* Edit modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-[#2a2a38] rounded-xl p-6 w-[90%] max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-gray-100">
            <h2 className="text-lg font-semibold mb-4">Update District</h2>

            <label className="text-sm text-gray-300 font-medium block mb-2">
              District Name
            </label>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="bg-[#0f0f12] text-gray-100 border border-[#2a2a38] rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-4"
              placeholder="Enter district name"
            />

            <label className="text-sm text-gray-300 font-medium block mb-2">
              City
            </label>
            <select
              value={editCityId}
              onChange={(e) => setEditCityId(e.target.value)}
              className="bg-[#0f0f12] text-gray-100 border border-[#2a2a38] rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-6"
            >
              <option value="">Select a city...</option>
              {cityOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsEditOpen(false);
                  setEditId(null);
                  setEditName("");
                  setEditCityId("");
                }}
                className="text-xs px-3 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                disabled={!(editName.trim() && editCityId)}
                className={[
                  "text-xs px-3 py-2 rounded-md bg-yellow-500 hover:bg-yellow-400 text-black font-semibold transition-colors",
                  !(editName.trim() && editCityId)
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

"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Table from "react-bootstrap/Table";
import Swal from "sweetalert2";
import { useTranslations, useLocale } from "next-intl";

/* ===== Countries actions ===== */
import {
  listCountries as listCountriesAction,
  addCountry,
  updateCountry,
  deleteCountry,
} from "@/action/country-actions";

/* ===== Cities actions ===== */
import {
  listAllCities,
  groupCitiesByCountry,
  addCity,
  updateCity,
  deleteCity,
} from "@/action/city-actions";

/* ===== Districts actions ===== */
import {
  getCityWithDistricts,
  addDistrict,
  updateDistrict,
  deleteDistrict,
} from "@/action/district-actions";

/* ---------- helpers ---------- */
const alphaCompare = (a, b) =>
  String(a || "").localeCompare(String(b || ""), undefined, {
    sensitivity: "base",
  });

function useClientPagedList(
  sourceItems,
  pageSize = 20,
  sortKey = "name",
  q = ""
) {
  const sorted = useMemo(() => {
    const arr = Array.isArray(sourceItems) ? [...sourceItems] : [];
    arr.sort((a, b) => alphaCompare(a?.[sortKey], b?.[sortKey]));
    return arr;
  }, [sourceItems, sortKey]);

  const filtered = useMemo(() => {
    if (!q) return sorted;
    const qq = q.trim().toLowerCase();
    return sorted.filter((x) =>
      String(x?.[sortKey] || "")
        .toLowerCase()
        .includes(qq)
    );
  }, [sorted, q, sortKey]);

  const [page, setPage] = useState(0);
  useEffect(() => setPage(0), [q]); // reset to first page on search change

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice(page * pageSize, page * pageSize + pageSize);

  return { pageItems, page, setPage, totalPages, totalCount: filtered.length };
}

/* ======================= Page ======================= */
export default function LocationManagerPage() {
  const t = useTranslations("admin.location");
  const locale = useLocale();

  /* ----- selections ----- */
  const [selectedCountry, setSelectedCountry] = useState(null); // {id,name}
  const [selectedCity, setSelectedCity] = useState(null); // {id,name}
  const [selectedDistrict, setSelectedDistrict] = useState(null); // {id,name}

  /* ----- countries ----- */
  const [countries, setCountries] = useState([]);
  const [countrySearch, setCountrySearch] = useState("");
  const [addingCountryName, setAddingCountryName] = useState("");
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [citySearch, setCitySearch] = useState("");

  const loadCountries = useCallback(async () => {
    setLoadingCountries(true);
    try {
      const list = await listCountriesAction();
      setCountries(Array.isArray(list) ? list : []);
    } finally {
      setLoadingCountries(false);
    }
  }, []);

  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  const {
    pageItems: pagedCountries,
    page: countryPage,
    setPage: setCountryPage,
    totalPages: countryTotalPages,
  } = useClientPagedList(countries, 10, "name", countrySearch);

  /* ----- cities (for selected country) ----- */
  const [allCities, setAllCities] = useState([]); // raw
  const [cityList, setCityList] = useState([]); // for selected country only
  const [addingCityName, setAddingCityName] = useState("");
  const [loadingCities, setLoadingCities] = useState(false);

  const {
    pageItems: pagedCities,
    page: cityPage,
    setPage: setCityPage,
    totalPages: cityTotalPages,
  } = useClientPagedList(cityList, 10, "name", citySearch);

  const reloadCities = useCallback(async () => {
    if (!selectedCountry?.name) {
      setAllCities([]);
      setCityList([]);
      return;
    }
    setLoadingCities(true);
    try {
      const list = await listAllCities();
      setAllCities(Array.isArray(list) ? list : []);
      const grouped = groupCitiesByCountry(list); // { [countryName]: [{id,name}, ...] }
      setCityList(
        Array.isArray(grouped[selectedCountry.name])
          ? grouped[selectedCountry.name]
          : []
      );
    } finally {
      setLoadingCities(false);
    }
  }, [selectedCountry?.name]);

  useEffect(() => {
    // when country changes -> clear selectedCity and load cities
    setSelectedCity(null);
    setSelectedDistrict(null);
    reloadCities();
  }, [selectedCountry?.id, reloadCities]);

  /* ----- districts (for selected city) ----- */
  const [districts, setDistricts] = useState([]); // [{id,name}]
  const [addingDistrictName, setAddingDistrictName] = useState("");
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  const {
    pageItems: pagedDistricts,
    page: districtPage,
    setPage: setDistrictPage,
    totalPages: districtTotalPages,
  } = useClientPagedList(districts, 10, "name", "");

  const reloadDistricts = useCallback(async () => {
    if (!selectedCity?.id) {
      setDistricts([]);
      return;
    }
    setLoadingDistricts(true);
    try {
      const city = await getCityWithDistricts(selectedCity.id);
      const list = Array.isArray(city?.districtMiniResponses)
        ? city.districtMiniResponses
        : [];
      setDistricts(list.map((d) => ({ id: d.id, name: d.name })));
    } finally {
      setLoadingDistricts(false);
    }
  }, [selectedCity?.id]);

  useEffect(() => {
    setSelectedDistrict(null);
    reloadDistricts();
  }, [selectedCity?.id, reloadDistricts]);

  /* ======================= handlers ======================= */
  // Country CRUD
  const onAddCountry = async () => {
    const name = String(addingCountryName || "").trim();
    if (!name) return;
    await addCountry({ name });
    setAddingCountryName("");
    await loadCountries();
  };

  const onEditCountry = async (c) => {
    const { value, isConfirmed } = await Swal.fire({
      title: t("countries.swal.renameTitle"),
      input: "text",
      inputValue: c.name || "",
      showCancelButton: true,
      confirmButtonText: t("countries.swal.save"),
      background: "#0f0f12",
      color: "#e5e7eb",
    });
    if (!isConfirmed) return;
    const name = String(value || "").trim();
    if (!name || name === c.name) return;
    await updateCountry({ id: c.id, name });
    if (selectedCountry?.id === c.id)
      setSelectedCountry({ ...selectedCountry, name });
    await loadCountries();
    if (selectedCountry?.id === c.id) await reloadCities();
    await Swal.fire({
      icon: "success",
      title: t("countries.swal.updated"),
      timer: 1200,
      showConfirmButton: false,
      background: "#0f0f12",
      color: "#e5e7eb",
    });
  };

  const onDeleteCountry = async (c) => {
    const { isConfirmed } = await Swal.fire({
      title: t("countries.swal.deleteTitle", { name: c.name }),
      text: t("countries.swal.deleteText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("countries.buttons.delete"),
      confirmButtonColor: "#ef4444",
      background: "#0f0f12",
      color: "#e5e7eb",
    });
    if (!isConfirmed) return;
    await deleteCountry(c.id);
    if (selectedCountry?.id === c.id) {
      setSelectedCountry(null);
      setSelectedCity(null);
      setDistricts([]);
      setCityList([]);
    }
    await loadCountries();
    await Swal.fire({
      icon: "success",
      title: t("countries.swal.deleted"),
      timer: 1000,
      showConfirmButton: false,
      background: "#0f0f12",
      color: "#e5e7eb",
    });
  };

  // City CRUD
  const onAddCity = async () => {
    const name = String(addingCityName || "").trim();
    if (!name || !selectedCountry?.id) return;
    await addCity({ name, countryId: Number(selectedCountry.id) });
    setAddingCityName("");
    await reloadCities();
  };

  const onEditCity = async (city) => {
    const { value, isConfirmed } = await Swal.fire({
      title: t("cities.swal.renameTitle"),
      input: "text",
      inputValue: city.name || "",
      showCancelButton: true,
      confirmButtonText: t("cities.swal.save"),
      background: "#0f0f12",
      color: "#e5e7eb",
    });
    if (!isConfirmed) return;
    const name = String(value || "").trim();
    if (!name || name === city.name) return;
    await updateCity({
      id: city.id,
      name,
      countryId: Number(selectedCountry.id),
    });
    if (selectedCity?.id === city.id) setSelectedCity({ ...city, name });
    await reloadCities();
    await Swal.fire({
      icon: "success",
      title: t("cities.swal.updated"),
      timer: 1200,
      showConfirmButton: false,
      background: "#1a1d24",
      color: "#e5e7eb",
    });
  };

  const onDeleteCity = async (city) => {
    const { isConfirmed } = await Swal.fire({
      title: t("cities.swal.deleteTitle", { name: city.name }),
      text: t("cities.swal.deleteText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("cities.buttons.delete"),
      confirmButtonColor: "#ef4444",
      background: "#1a1d24",
      color: "#e5e7eb",
    });
    if (!isConfirmed) return;
    await deleteCity(city.id);
    if (selectedCity?.id === city.id) {
      setSelectedCity(null);
      setDistricts([]);
    }
    await reloadCities();
    await Swal.fire({
      icon: "success",
      title: t("cities.swal.deleted"),
      timer: 1000,
      showConfirmButton: false,
      background: "#1a1d24",
      color: "#e5e7eb",
    });
  };

  // District CRUD
  const onAddDistrict = async () => {
    const name = String(addingDistrictName || "").trim();
    if (!name || !selectedCity?.id) return;
    await addDistrict({ name, cityId: Number(selectedCity.id) });
    setAddingDistrictName("");
    await reloadDistricts();
  };

  const onEditDistrict = async (d) => {
    const { value, isConfirmed } = await Swal.fire({
      title: t("districts.swal.renameTitle"),
      input: "text",
      inputValue: d.name || "",
      showCancelButton: true,
      confirmButtonText: t("districts.swal.save"),
      background: "#1a1d24",
      color: "#e5e7eb",
    });
    if (!isConfirmed) return;
    const name = String(value || "").trim();
    if (!name || name === d.name) return;
    await updateDistrict({ id: d.id, name, cityId: Number(selectedCity.id) });
    await reloadDistricts();
    await Swal.fire({
      icon: "success",
      title: t("districts.swal.updated"),
      timer: 1200,
      showConfirmButton: false,
      background: "#0f0f12",
      color: "#e5e7eb",
    });
  };

  const onDeleteDistrict = async (d) => {
    const { isConfirmed } = await Swal.fire({
      title: t("districts.swal.deleteTitle", { name: d.name }),
      text: t("districts.swal.deleteText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("districts.buttons.delete"),
      confirmButtonColor: "#ef4444",
      background: "#0f0f12",
      color: "#e5e7eb",
    });
    if (!isConfirmed) return;
    await deleteDistrict(d.id);
    await reloadDistricts();
    await Swal.fire({
      icon: "success",
      title: t("districts.swal.deleted"),
      timer: 1000,
      showConfirmButton: false,
      background: "#0f0f12",
      color: "#e5e7eb",
    });
  };

  /* ======================= UI ======================= */
  return (
    <div className="p-6 text-white flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="text-sm text-gray-400">{t("subtitle")}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Countries */}
        <div className="bg-[#0f0f12]/80 border border-[#2a2a38] rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#2a2a38]">
            <div className="font-semibold">{t("countries.title")}</div>
            <div className="flex items-center gap-2">
              <input
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                placeholder={t("countries.search")}
                className="bg-[#0f0f12] text-gray-100 border border-[#2a2a38] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          <div className="px-4 py-3 flex items-end gap-2 border-b border-[#2a2a38]">
            <input
              value={addingCountryName}
              onChange={(e) => setAddingCountryName(e.target.value)}
              placeholder={t("countries.newPlaceholder")}
              className="flex-1 bg-[#0f0f12] text-gray-100 border border-[#2a2a38] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <button
              onClick={onAddCountry}
              disabled={!addingCountryName.trim()}
              className={[
                "bg-yellow-500 hover:brightness-110 text-black font-semibold text-sm px-3 py-2 rounded-md transition-all",
                !addingCountryName.trim()
                  ? "opacity-40 cursor-not-allowed"
                  : "",
              ].join(" ")}
            >
              {"+ " + t("countries.add")}
            </button>
          </div>

          {loadingCountries ? (
            <div className="p-6 text-center text-sm text-gray-400">
              {t("loading")}
            </div>
          ) : pagedCountries.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-gray-500">
              {t("empty.countries")}
            </div>
          ) : (
            <div className="px-4 py-3">
              <Table striped bordered hover size="sm" className="text-gray-150">
                <thead>
                  <tr>
                    <th style={{ width: 56 }}>#</th>
                    <th>{t("countries.headers.name")}</th>
                    <th style={{ width: 160 }}>
                      {t("countries.headers.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pagedCountries.map((c, idx) => (
                    <tr
                      key={c.id}
                      className={
                        (selectedCountry?.id === c.id ? "table-primary " : "") +
                        "transition-colors"
                      }
                      onClick={() => setSelectedCountry(c)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{countryPage * 10 + idx + 1}</td>
                      <td>{c.name}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditCountry(c);
                            }}
                            className="bg-yellow-500 hover:bg-yellow-400 text-black text-[11px] px-2 py-[2px] rounded-md"
                          >
                            {t("countries.buttons.edit")}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteCountry(c);
                            }}
                            className="bg-yellow-500 hover:bg-yellow-400 text-black text-[11px] px-2 py-[2px] rounded-md"
                          >
                            {t("countries.buttons.delete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {/* pagination */}
          <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-[#2a2a38]">
            <button
              className="px-2 py-1 text-xs border border-[#2a2a38] rounded disabled:opacity-40"
              disabled={countryPage === 0}
              onClick={() => setCountryPage(0)}
            >
              {t("pagination.first")}
            </button>
            <button
              className="px-2 py-1 text-xs border border-[#2a2a38] rounded disabled:opacity-40"
              disabled={countryPage === 0}
              onClick={() => setCountryPage((p) => Math.max(0, p - 1))}
            >
              {t("pagination.prev")}
            </button>
            <span className="text-xs text-gray-400">
              {t("pagination.page", {
                page: countryPage + 1,
                total: countryTotalPages,
              })}
            </span>
            <button
              className="px-2 py-1 text-xs border border-[#2a2a38] rounded disabled:opacity-40"
              disabled={countryPage + 1 >= countryTotalPages}
              onClick={() => setCountryPage((p) => p + 1)}
            >
              {t("pagination.next")}
            </button>
            <button
              className="px-2 py-1 text-xs border border-[#2a2a38] rounded disabled:opacity-40"
              disabled={countryPage + 1 >= countryTotalPages}
              onClick={() => setCountryPage(countryTotalPages - 1)}
            >
              {t("pagination.last")}
            </button>
          </div>
        </div>

        {/* Cities */}
        <div className="bg-[#0f0f12]/80 border border-[#2a2a38] rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#2a2a38]">
            <div className="font-semibold">
              {t("cities.title")}{" "}
              {selectedCountry ? (
                <span className="text-gray-400">
                  {t("cities.of", { country: selectedCountry.name })}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <input
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                placeholder={t("cities.search")}
                disabled={!selectedCountry}
                className={[
                  "bg-[#0f0f12] text-gray-100 border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2",
                  !selectedCountry
                    ? "border-[#3a3a3a] text-gray-500 cursor-not-allowed opacity-40"
                    : "border-[#2a2a38] focus:ring-yellow-500",
                ].join(" ")}
              />
            </div>
          </div>

          {/* add city */}
          <div className="px-4 py-3 flex items-end gap-2 border-b border-[#2a2a38]">
            <input
              value={addingCityName}
              onChange={(e) => setAddingCityName(e.target.value)}
              placeholder={
                selectedCountry
                  ? t("cities.newPlaceholder")
                  : t("cities.selectCountryFirst")
              }
              disabled={!selectedCountry}
              className={[
                "flex-1 bg-[#0f0f12] text-gray-100 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2",
                !selectedCountry
                  ? "border-[#3a3a3a] text-gray-500 cursor-not-allowed opacity-40"
                  : "border-[#2a2a38] focus:ring-yellow-500",
              ].join(" ")}
            />
            <button
              onClick={onAddCity}
              disabled={!selectedCountry || !addingCityName.trim()}
              className={[
                "bg-yellow-500 hover:brightness-110 text-black font-semibold text-sm px-3 py-2 rounded-md transition-all",
                !selectedCountry || !addingCityName.trim()
                  ? "opacity-40 cursor-not-allowed"
                  : "",
              ].join(" ")}
            >
              {"+ " + t("cities.add")}
            </button>
          </div>

          {/* list cities */}
          {selectedCountry ? (
            loadingCities ? (
              <div className="p-6 text-center text-sm text-gray-400">
                {t("loading")}
              </div>
            ) : cityList.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-gray-500">
                {t("empty.cities")}
              </div>
            ) : (
              <>
                <div className="px-4 py-3">
                  <Table
                    striped
                    bordered
                    hover
                    size="sm"
                    className="text-gray-100"
                  >
                    <thead>
                      <tr>
                        <th style={{ width: 56 }}>#</th>
                        <th>{t("cities.headers.name")}</th>
                        <th style={{ width: 160 }}>
                          {t("cities.headers.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedCities.map((c, idx) => (
                        <tr
                          key={c.id}
                          className={
                            (selectedCity?.id === c.id
                              ? "table-primary "
                              : "") + "transition-colors"
                          }
                          onClick={() => setSelectedCity(c)}
                          style={{ cursor: "pointer" }}
                        >
                          <td>{cityPage * 10 + idx + 1}</td>
                          <td>{c.name}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditCity(c);
                                }}
                                className="bg-yellow-500 hover:bg-yellow-400 text-black text-[11px] px-2 py-[2px] rounded-md"
                              >
                                {t("cities.buttons.edit")}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteCity(c);
                                }}
                                className="bg-yellow-500 hover:bg-yellow-400 text-black text-[11px] px-2 py-[2px] rounded-md"
                              >
                                {t("cities.buttons.delete")}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-[#2a2a38]">
                  <button
                    className="px-2 py-1 text-xs border border-[#2a2a38] rounded disabled:opacity-40"
                    disabled={cityPage === 0}
                    onClick={() => setCityPage(0)}
                  >
                    {t("pagination.first")}
                  </button>
                  <button
                    className="px-2 py-1 text-xs border border-[#2a2a38] rounded disabled:opacity-40"
                    disabled={cityPage === 0}
                    onClick={() => setCityPage((p) => Math.max(0, p - 1))}
                  >
                    {t("pagination.prev")}
                  </button>
                  <span className="text-xs text-gray-400">
                    {t("pagination.page", {
                      page: cityPage + 1,
                      total: cityTotalPages,
                    })}
                  </span>
                  <button
                    className="px-2 py-1 text-xs border border-[#2a2a38] rounded disabled:opacity-40"
                    disabled={cityPage + 1 >= cityTotalPages}
                    onClick={() => setCityPage((p) => p + 1)}
                  >
                    {t("pagination.next")}
                  </button>
                  <button
                    className="px-2 py-1 text-xs border border-[#2a2a38] rounded disabled:opacity-40"
                    disabled={cityPage + 1 >= cityTotalPages}
                    onClick={() => setCityPage(cityTotalPages - 1)}
                  >
                    {t("pagination.last")}
                  </button>
                </div>
              </>
            )
          ) : (
            <div className="p-6 text-center text-xs text-gray-500">
              {t("cities.prompts.selectCountry")}
            </div>
          )}
        </div>

        {/* Districts */}
        <div className="bg-[#0f0f12]/80 border border-[#2a2a38] rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          <div className="px-4 py-3 border-b border-[#2a2a38]">
            <div className="font-semibold">
              {t("districts.title")}{" "}
              {selectedCity ? (
                <span className="text-gray-400">
                  {t("districts.of", { city: selectedCity.name })}
                </span>
              ) : selectedCountry ? (
                <span className="text-gray-400">
                  {t("districts.selectCity")}
                </span>
              ) : null}
            </div>
          </div>

          {/* add district */}
          <div className="px-4 py-3 flex items-end gap-2 border-b border-[#2a2a38]">
            <input
              value={addingDistrictName}
              onChange={(e) => setAddingDistrictName(e.target.value)}
              placeholder={
                selectedCity
                  ? t("districts.newPlaceholder")
                  : t("districts.selectCityFirst")
              }
              disabled={!selectedCity}
              className={[
                "flex-1 bg-[#0f0f12] text-gray-100 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2",
                !selectedCity
                  ? "border-[#3a3a3a] text-gray-500 cursor-not-allowed opacity-40"
                  : "border-[#2a2a38] focus:ring-yellow-500",
              ].join(" ")}
            />
            <button
              onClick={onAddDistrict}
              disabled={!selectedCity || !addingDistrictName.trim()}
              className={[
                "bg-yellow-500 hover:brightness-110 text-black font-semibold text-sm px-3 py-2 rounded-md transition-all",
                !selectedCity || !addingDistrictName.trim()
                  ? "opacity-40 cursor-not-allowed"
                  : "",
              ].join(" ")}
            >
              {"+ " + t("districts.add")}
            </button>
          </div>

          {/* list districts */}
          {selectedCity ? (
            loadingDistricts ? (
              <div className="p-6 text-center text-sm text-gray-400">
                {t("loading")}
              </div>
            ) : districts.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-gray-500">
                {t("empty.districts")}
              </div>
            ) : (
              <>
                <div className="px-4 py-3">
                  <Table
                    striped
                    bordered
                    hover
                    size="sm"
                    className="text-gray-100"
                  >
                    <thead>
                      <tr>
                        <th style={{ width: 56 }}>#</th>
                        <th>{t("districts.headers.name")}</th>
                        <th style={{ width: 160 }}>
                          {t("districts.headers.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedDistricts.map((d, idx) => (
                        <tr
                          key={d.id}
                          className={
                            (selectedDistrict?.id === d.id
                              ? "table-primary "
                              : "") + "transition-colors"
                          }
                          onClick={() => setSelectedDistrict(d)}
                          style={{ cursor: "pointer" }}
                        >
                          <td>{districtPage * 10 + idx + 1}</td>
                          <td>{d.name}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditDistrict(d);
                                }}
                                className="bg-yellow-500 hover:bg-yellow-400 text-black text-[11px] px-2 py-[2px] rounded-md"
                              >
                                {t("districts.buttons.edit")}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteDistrict(d);
                                }}
                                className="bg-yellow-500 hover:bg-yellow-400 text-black text-[11px] px-2 py-[2px] rounded-md"
                              >
                                {t("districts.buttons.delete")}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-[#2a2a38]">
                  <button
                    className="px-2 py-1 text-xs border border-[#2a2a38] rounded disabled:opacity-40"
                    disabled={districtPage === 0}
                    onClick={() => setDistrictPage(0)}
                  >
                    {t("pagination.first")}
                  </button>
                  <button
                    className="px-2 py-1 text-xs border border-[#2a2a38] rounded disabled:opacity-40"
                    disabled={districtPage === 0}
                    onClick={() => setDistrictPage((p) => Math.max(0, p - 1))}
                  >
                    {t("pagination.prev")}
                  </button>
                  <span className="text-xs text-gray-400">
                    {t("pagination.page", {
                      page: districtPage + 1,
                      total: districtTotalPages,
                    })}
                  </span>
                  <button
                    className="px-2 py-1 text-xs border border-[#2a2a38] rounded disabled:opacity-40"
                    disabled={districtPage + 1 >= districtTotalPages}
                    onClick={() => setDistrictPage((p) => p + 1)}
                  >
                    {t("pagination.next")}
                  </button>
                  <button
                    className="px-2 py-1 text-xs border border-[#2a2a38] rounded disabled:opacity-40"
                    disabled={districtPage + 1 >= districtTotalPages}
                    onClick={() => setDistrictPage(districtTotalPages - 1)}
                  >
                    {t("pagination.last")}
                  </button>
                </div>
              </>
            )
          ) : (
            <div className="p-6 text-center text-xs text-gray-500">
              {t("districts.prompts.selectCity")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

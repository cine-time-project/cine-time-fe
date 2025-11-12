"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import Table from "react-bootstrap/Table";
import Pagination from "react-bootstrap/Pagination";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Swal from "sweetalert2";
import axios from "axios";

import { authHeaders, hasRole, isAdmin } from "@/lib/utils/http";
import { USER_LIST_API, userUpdateByIdApi } from "@/helpers/api-routes";

const PAGE_SIZE = 10;
const ALL_ROLES = ["ANONYMOUS", "MEMBER", "EMPLOYEE", "ADMIN"];

export default function AdminRolesPage() {
  const t = useTranslations("admin.roles");
  const locale = useLocale();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const AVAILABLE_ROLES = useMemo(
    () => (isAdmin() ? ALL_ROLES : ["ANONYMOUS", "MEMBER", "EMPLOYEE"]),
    []
  );

  const L = useMemo(() => {
    return (rest = "") => (rest ? `/${locale}/${rest.replace(/^\/+/,'')}` : `/${locale}`);
  }, [locale]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  // ========= Data Fetch =========
  useEffect(() => {
    console.log(isAdmin());
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(USER_LIST_API, {
          headers: authHeaders({ Accept: "application/json" }),
        });
        if (!cancelled) {
          const data = Array.isArray(res.data) ? res.data : [];
          setUsers(data);
          setPage(1);
        }
      } catch (e) {
        if (!cancelled)
          setError(
            e?.response?.data?.message || e?.message || t("loadError")
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phoneNumber && u.phoneNumber.toLowerCase().includes(q))
    );
  }, [users, query]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
    [filtered.length]
  );
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const handleSelect = (p) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  // ========= Edit Roles =========
  async function onEditRoles(user) {
    const current = Array.isArray(user.roles) ? user.roles : [];

    // Build HTML checkboxes for SweetAlert
    const optionsHtml = AVAILABLE_ROLES.map((r) => {
      const id = `role_${r}`;
      const checked = current.includes(r) ? "checked" : "";
      return `<div style="text-align:left;margin:.25rem 0;">
                  <input type="checkbox" id="${id}" value="${r}" ${checked}/> 
                  <label for="${id}" style="margin-left:.5rem;">${r}</label>
                </div>`;
    }).join("");

    const { isConfirmed } = await Swal.fire({
      title: t("swal.editTitle", { name: `${user.name ?? ''} ${user.surname ?? ''}`.trim() }),
      html: `<div>${optionsHtml}</div>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: t("swal.save"),
      preConfirm: () => {
        const selected = Array.from(
          document.querySelectorAll("input[id^='role_']:checked")
        ).map((el) => el.value);
        if (selected.length === 0) {
          Swal.showValidationMessage(t("swal.selectOne"));
        }
        return selected;
      },
    });

    if (!isConfirmed) return;

    // SweetAlert stores the result in Swal.getPopup().returnValue via preConfirm, fetch it here
    const selectedRoles = Array.from(
      document.querySelectorAll("input[id^='role_']:checked")
    ).map((el) => el.value);

    const payloadRoles = isAdmin()
      ? selectedRoles
      : selectedRoles.filter((r) => r !== "ADMIN");

    try {
      await axios.put(
        userUpdateByIdApi(user.id),
        { roles: payloadRoles },
        { headers: authHeaders({ "Content-Type": "application/json" }) }
      );

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, roles: payloadRoles } : u))
      );
      await Swal.fire({
        icon: "success",
        title: t("swal.updated"),
        text: t("swal.updatedText"),
      });
    } catch (e) {
      const msg =
        e?.response?.data?.message || e?.message || t("swal.updateFailed");
      await Swal.fire({ icon: "error", title: t("swal.updateFailed"), text: msg });
    }
  }

  return (
    <div className="container-fluid py-3">
      <h1 className="mb-3 text-white">{t("title")}</h1>

      {loading && (
        <div className="d-flex align-items-center gap-2">
          <Spinner animation="border" size="sm" />
          <span>{t("loading")}</span>
        </div>
      )}

      {!loading && error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && (
        <>
          <div className="mb-3">
            <InputGroup>
              <InputGroup.Text>{t("filters.search")}</InputGroup.Text>
              <Form.Control
                placeholder={t("filters.searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </InputGroup>
          </div>

          <Table striped bordered hover responsive size="sm" className="mb-3">
            <thead>
              <tr>
                <th>#</th>
                <th>{t("table.name")}</th>
                <th>{t("table.surname")}</th>
                <th>{t("table.email")}</th>
                <th>{t("table.phone")}</th>
                <th>{t("table.roles")}</th>
                <th style={{ width: 120 }}>{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center">
                    {t("table.empty")}
                  </td>
                </tr>
              ) : (
                pageItems.map((u, idx) => (
                  <tr key={u.id}>
                    <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td>
                      {(() => {
                        const nameText = `${u.name ?? ''} ${u.surname ?? ''}`.trim();
                        const uid = u.id;
                        if (!uid || !nameText) return nameText;
                        return (<Link href={L(`admin/users/${uid}`)} prefetch>{nameText}</Link>);
                      })()}
                    </td>
                    <td>{u.surname}</td>
                    <td>{u.email}</td>
                    <td>{u.phoneNumber}</td>
                    <td>{Array.isArray(u.roles) ? u.roles.join(", ") : ""}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => onEditRoles(u)}
                      >
                        {t("buttons.editRoles")}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              {t("showing", { from: (page - 1) * PAGE_SIZE + 1, to: Math.min(page * PAGE_SIZE, filtered.length), total: filtered.length })}
            </small>

            <Pagination className="mb-0">
              <Pagination.First
                onClick={() => handleSelect(1)}
                disabled={page === 1}
              />
              <Pagination.Prev
                onClick={() => handleSelect(page - 1)}
                disabled={page === 1}
              />
              {Array.from({ length: totalPages }).map((_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={page === i + 1}
                  onClick={() => handleSelect(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={() => handleSelect(page + 1)}
                disabled={page === totalPages}
              />
              <Pagination.Last
                onClick={() => handleSelect(totalPages)}
                disabled={page === totalPages}
              />
            </Pagination>
          </div>
        </>
      )}
    </div>
  );
}

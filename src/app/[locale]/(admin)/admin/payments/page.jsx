"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Table from "react-bootstrap/Table";
import Pagination from "react-bootstrap/Pagination";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";
import Swal from "sweetalert2";
import axios from "axios";
import {useTranslations, useLocale } from "next-intl";
import Link from "next/link";

import { authHeaders, isAdmin } from "@/lib/utils/http";
// If you keep all routes in one place, expose a base/route like this:
import { PAYMENT_LIST_API /*, paymentRefundApi */ } from "@/helpers/api-routes";

 


// Fallback if you don’t have PAYMENT_LIST_API defined yet:
const FALLBACK_ENDPOINT = "/api/payment"; // filtered list endpoint on backend

const PAGE_SIZE_DEFAULT = 10;

function buildQuery(params = {}) {
  // Build query string; drop empty/undefined values
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === null || v === undefined) return;
    if (typeof v === "string" && v.trim() === "") return;
    q.set(k, String(v));
  });
  return q.toString();
}

export default function PaymentsPage() {
  // ---------- state ----------
  const [items, setItems] = useState([]); // content
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0); // 0-based (backend expects 0)
  const [size, setSize] = useState(PAGE_SIZE_DEFAULT);
  const [sort, setSort] = useState("paymentDate");
  const [type, setType] = useState("DESC");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
    const locale = useLocale();
    const t = useTranslations("admin.payments");
    const L = useCallback(
      (rest = "") => (rest ? `/${locale}/${rest.replace(/^\/+/, "")}` : `/${locale}`),
      [locale]
    );

  // ---------- filters ----------
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState(""); // e.g., SUCCESS / FAILED / REFUNDED (whatever your enum has)
  const [from, setFrom] = useState(""); // yyyy-mm-dd
  const [to, setTo] = useState(""); // yyyy-mm-dd
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [providerRef, setProviderRef] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [q, setQ] = useState("");

  const cancelRef = useRef(null);

  // compute endpoint
  const LIST_ENDPOINT = PAYMENT_LIST_API ?? FALLBACK_ENDPOINT;

  const queryString = useMemo(() => {
    return buildQuery({
      page,
      size,
      sort,
      type,

      userId: userId || undefined,
      email: email || undefined,
      phone: phone || undefined,
      status: status || undefined,
      from: from || undefined,
      to: to || undefined,
      minAmount: minAmount || undefined,
      maxAmount: maxAmount || undefined,
      providerRef: providerRef || undefined,
      idempotencyKey: idempotencyKey || undefined,
      q: q || undefined,
    });
  }, [
    page,
    size,
    sort,
    type,
    userId,
    email,
    phone,
    status,
    from,
    to,
    minAmount,
    maxAmount,
    providerRef,
    idempotencyKey,
    q,
  ]);

  const fetchData = useCallback(async () => {
    if (cancelRef.current) {
      cancelRef.current.cancel("New request");
    }
    cancelRef.current = axios.CancelToken.source();
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${LIST_ENDPOINT}?${queryString}`, {
        headers: authHeaders({ Accept: "application/json" }),
        cancelToken: cancelRef.current.token,
      });
      const data = res.data ?? {};
      const content = Array.isArray(data?.content)
        ? data.content
        : Array.isArray(data)
        ? data
        : [];
      setItems(content);
      setTotalElements(Number(data?.totalElements ?? content.length ?? 0));
      setTotalPages(Number(data?.totalPages ?? 1));
    } catch (e) {
      if (!axios.isCancel(e)) {
        setError(
          e?.response?.data?.message || e?.message || t("loadError")
        );
      }
    } finally {
      setLoading(false);
    }
  }, [LIST_ENDPOINT, queryString, t]);

  useEffect(() => {
    fetchData();
    // cancel on unmount
    return () => {
      if (cancelRef.current) cancelRef.current.cancel("Unmount");
    };
  }, [fetchData]);

  // reset to page 0 when filters change (but not when page/size/sort/type alone change)
  useEffect(() => {
    setPage(0);
  }, [
    userId,
    email,
    phone,
    status,
    from,
    to,
    minAmount,
    maxAmount,
    providerRef,
    idempotencyKey,
    q,
  ]);

  const onRefund = async (payment) => {
    if (!isAdmin()) return; // safety check

    const { value: formValues, isConfirmed } = await Swal.fire({
      title: `Refund Payment #${payment.paymentId}`,
      html: `
        <div style="text-align:left">
          <div style="margin-bottom:.5rem;">
            <label>Amount (optional, default full):</label>
            <input id="ref-amount" class="swal2-input" type="number" step="0.01" min="0" placeholder="${
              payment.paymentAmount ?? ""
            }">
          </div>
          <div>
            <label>Reason (required):</label>
            <textarea id="ref-reason" class="swal2-textarea" placeholder="Reason for refund" rows="3"></textarea>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Refund",
      preConfirm: () => {
        const amt = document.getElementById("ref-amount")?.value;
        const reason = document.getElementById("ref-reason")?.value?.trim();
        if (!reason) {
          Swal.showValidationMessage("Reason is required");
          return;
        }
        const payload = {};
        if (amt && Number(amt) > 0) payload.amount = Number(amt);
        payload.reason = reason;
        return payload;
      },
    });

    if (!isConfirmed) return;

    // TODO: uncomment when refund endpoint exists
    // try {
    //   await axios.post(paymentRefundApi(payment.paymentId), formValues, {
    //     headers: authHeaders({ "Content-Type": "application/json" }),
    //   });
    //   await Swal.fire({ icon: "success", title: "Refunded", text: "Refund created successfully." });
    //   fetchData();
    // } catch (e) {
    //   await Swal.fire({ icon: "error", title: "Refund failed", text: e?.response?.data?.message || e?.message || "Failed to refund." });
    // }
    await Swal.fire({
      icon: "info",
      title: "TODO",
      text: "Wire refund endpoint when ready.",
    });
  };

  const onClearFilters = () => {
    setUserId("");
    setEmail("");
    setPhone("");
    setStatus("");
    setFrom("");
    setTo("");
    setMinAmount("");
    setMaxAmount("");
    setProviderRef("");
    setIdempotencyKey("");
    setQ("");
  };

  const pageFrom = totalElements === 0 ? 0 : page * size + 1;
  const pageTo = Math.min((page + 1) * size, totalElements);

  return (
    <div className="container-fluid py-3">
      <h2 className="mb-3">{t("title")}</h2>

      {/* Filters */}
      <Form className="mb-3" onSubmit={(e) => e.preventDefault()}>
        <Row className="g-2">
          <Col md={2}>
            <InputGroup>
              <InputGroup.Text>{t("filters.userId")}</InputGroup.Text>
              <Form.Control
                value={userId}
                onChange={(e) => setUserId(e.target.value.replace(/\D+/g, ""))}
                placeholder="e.g. 3"
                inputMode="numeric"
              />
            </InputGroup>
          </Col>
          <Col md={3}>
            <InputGroup>
              <InputGroup.Text>{t("filters.email")}</InputGroup.Text>
              <Form.Control
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </InputGroup>
          </Col>
          <Col md={3}>
            <InputGroup>
              <InputGroup.Text>{t("filters.phone")}</InputGroup.Text>
              <Form.Control
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1..."
              />
            </InputGroup>
          </Col>
          <Col md={2}>
            <Form.Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">{t("filters.status")}</option>
              <option value="SUCCESS">{t("status.SUCCESS")}</option>
              <option value="FAILED">{t("status.FAILED")}</option>
              <option value="REFUNDED">{t("status.REFUNDED")}</option>
              <option value="PARTIALLY_REFUNDED">{t("status.PARTIALLY_REFUNDED")}</option>
              {/* add others if your enum has more */}
            </Form.Select>
          </Col>
          <Col md={2}>
            <InputGroup>
              <InputGroup.Text>{t("filters.search")}</InputGroup.Text>
              <Form.Control
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="email/phone/ref/key"
              />
            </InputGroup>
          </Col>
        </Row>

        <Row className="g-2 mt-1">
          <Col md={2}>
            <InputGroup>
              <InputGroup.Text>{t("filters.from")}</InputGroup.Text>
              <Form.Control
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md={2}>
            <InputGroup>
              <InputGroup.Text>{t("filters.to")}</InputGroup.Text>
              <Form.Control
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md={2}>
            <InputGroup>
              <InputGroup.Text>{t("filters.min")}</InputGroup.Text>
              <Form.Control
                type="number"
                step="0.01"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md={2}>
            <InputGroup>
              <InputGroup.Text>{t("filters.max")}</InputGroup.Text>
              <Form.Control
                type="number"
                step="0.01"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md={2}>
            <InputGroup>
              <InputGroup.Text>{t("filters.provider")}</InputGroup.Text>
              <Form.Control
                value={providerRef}
                onChange={(e) => setProviderRef(e.target.value)}
                placeholder="provider ref"
              />
            </InputGroup>
          </Col>
          <Col md={2}>
            <InputGroup>
              <InputGroup.Text>{t("filters.key")}</InputGroup.Text>
              <Form.Control
                value={idempotencyKey}
                onChange={(e) => setIdempotencyKey(e.target.value)}
                placeholder="idempotency"
              />
            </InputGroup>
          </Col>
        </Row>

        <Row className="g-2 mt-2">
          <Col md={2}>
            <Form.Select
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n} {t("perPageSuffix")}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3}>
            <InputGroup>
              <InputGroup.Text>Sort</InputGroup.Text>
              <Form.Select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="paymentDate">paymentDate</option>
                <option value="amount">amount</option>
                <option value="id">id</option>
              </Form.Select>
              <Form.Select
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="DESC">DESC</option>
                <option value="ASC">ASC</option>
              </Form.Select>
            </InputGroup>
          </Col>
          <Col className="d-flex gap-2">
            <Button variant="primary" onClick={() => fetchData()}>
              {t("apply")}
            </Button>
            <Button variant="outline-secondary" onClick={onClearFilters}>
              {t("clear")}
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Loading / Error */}
      {loading && (
        <div className="d-flex align-items-center gap-2 mb-2">
          <Spinner animation="border" size="sm" />
          <span>{t("loading")}</span>
        </div>
      )}
      {!!error && <Alert variant="danger">{error}</Alert>}

      {/* Table */}
      <Table striped bordered hover responsive size="sm" className="mb-3">
        <thead>
          <tr>
            <th>#</th>
            <th>{t("table.date")}</th>
            <th>{t("table.user")}</th>
            <th>{t("table.email")}</th>
            <th>{t("table.amount")}</th>
            <th>{t("table.currency")}</th>
            <th>{t("table.status")}</th>
            <th>{t("table.providerRef")}</th>
            <th>{t("table.idempotencyKey")}</th>
            <th style={{ width: 110 }}>{t("table.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center">
                {t("table.empty")}
              </td>
            </tr>
          ) : (
            items.map((p, i) => (
              <tr key={p.paymentId ?? `${p.id}-${i}`}>
                <td>{page * size + i + 1}</td>
                <td>
                  {p.paymentDate
                    ? new Date(p.paymentDate).toISOString().split("T")[0]
                    : ""}
                </td>
                <td>
                  {(() => {
                    const nameText =
                      p.userName ?? (p.user ? `${p.user.name ?? ""} ${p.user.surname ?? ""}`.trim() : "");
                    const uid = p.userId ?? p.user?.id;
                    if (!uid || !nameText) return nameText;
                    return (
                      <Link href={L(`admin/users/${uid}`)} prefetch>
                        {nameText}
                      </Link>
                    );
                  })()}
                </td>
                <td>{p.userEmail ?? p.user?.email ?? ""}</td>
                <td>{p.paymentAmount ?? ""}</td>
                <td>{p.paymentCurrency ?? ""}</td>
                <td>
                  <Badge
                    bg={
                      String(p.paymentStatus ?? "").includes("REFUND")
                        ? "warning"
                        : "success"
                    }
                  >
                    {p.paymentStatus ? t(`status.${p.paymentStatus}`) : ""}
                  </Badge>
                </td>
                <td className="text-truncate" style={{ maxWidth: 160 }}>
                  {p.paymentProviderReference ?? ""}
                </td>
                <td className="text-truncate" style={{ maxWidth: 160 }}>
                  {p.paymentIdempotencyKey ?? ""}
                </td>
                <td className="text-nowrap">
                  {/* TODO: View modal/drawer to show tickets */}
                  {isAdmin() && (
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => onRefund(p)}
                    >
                      {t("buttons.refund")}
                    </Button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center">
        <small className="text-muted">
          {t("showing", { from: pageFrom, to: pageTo, total: totalElements })}
        </small>
        <Pagination className="mb-0">
          <Pagination.First onClick={() => setPage(0)} disabled={page === 0} />
          <Pagination.Prev
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          />
          {Array.from({ length: totalPages }).map((_, i) => (
            <Pagination.Item
              key={i}
              active={page === i}
              onClick={() => setPage(i)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          />
          <Pagination.Last
            onClick={() => setPage(totalPages - 1)}
            disabled={page >= totalPages - 1}
          />
        </Pagination>
      </div>
    </div>
  );
}

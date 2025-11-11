"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Button,
} from "react-bootstrap";
import { useTranslations } from "next-intl";
import Swal from "sweetalert2";
import { ContactMessageCard } from "./ContactMessageCard";
import {
  getAllContactMessagesAction,
  deleteContactMessageAction,
} from "@/action/contact-message-actions";
import "./ContactMessagesDashboard.scss";

/**
 * Contact Messages Dashboard Component
 * Admin interface for viewing and managing contact form messages
 */
export const ContactMessagesDashboard = () => {
  const t = useTranslations("dashboard.contactMessages");
  const tswal = useTranslations("swal");

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  /**
   * Load contact messages from server
   * Sorts messages by creation date (newest first)
   */
  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getAllContactMessagesAction();

      if (!result.ok) {
        setError(result.message);
        setMessages([]);
        return;
      }

      // Sort by creation date (newest first)
      const sorted = result.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setMessages(sorted);
    } catch (err) {
      console.error("Failed to load messages:", err);
      setError(err.message);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  /**
   * Handle message deletion with confirmation dialog
   * @param {Object} message - Message object to delete
   */
  const handleDelete = async (message) => {
    const result = await Swal.fire({
      icon: "warning",
      title: t("deleteConfirm.title"),
      html: `
        <p>${t("deleteConfirm.text")}</p>
        <div class="text-start mt-3 p-3 bg-light rounded">
          <strong>${message.fullName}</strong><br/>
          <small class="text-muted">${message.email}</small><br/>
          <small class="text-muted">${t("deleteConfirm.subject")}: ${
        message.subject
      }</small>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: tswal("delete"),
      cancelButtonText: tswal("cancel"),
    });

    if (!result.isConfirmed) return;

    try {
      setDeleting(message.id);

      const deleteResult = await deleteContactMessageAction(message.id);

      if (!deleteResult.ok) {
        throw new Error(deleteResult.message);
      }

      // Remove from local state
      setMessages((prev) => prev.filter((m) => m.id !== message.id));

      await Swal.fire({
        icon: "success",
        title: t("deleteSuccess.title"),
        text: t("deleteSuccess.text"),
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Failed to delete message:", err);
      await Swal.fire({
        icon: "error",
        title: t("deleteError.title"),
        text: err.message || t("deleteError.text"),
        confirmButtonText: tswal("confirm"),
      });
    } finally {
      setDeleting(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Container className="contact-messages-dashboard py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">{t("loading")}</p>
        </div>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container className="contact-messages-dashboard py-5">
        <Alert variant="danger">
          <Alert.Heading>
            <i className="bi bi-exclamation-triangle me-2"></i>
            {t("error.title")}
          </Alert.Heading>
          <p>
            {t("error.text")}: {error}
          </p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button variant="outline-danger" onClick={loadMessages}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              {t("error.retry")}
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="contact-messages-dashboard py-4">
      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-1">
                  <i className="bi bi-envelope-open me-2 text-primary"></i>
                  {t("title")}
                </h2>
                <p className="text-muted mb-0">
                  {t("subtitle")} ({messages.length} {t("messageCount")})
                </p>
              </div>
              <Button
                variant="outline-primary"
                onClick={loadMessages}
                disabled={loading}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                {t("refresh")}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Messages List */}
      {messages.length === 0 ? (
        <Row>
          <Col>
            <Alert
              variant="info"
              className="text-center py-5 border-0 bg-light"
            >
              <i className="bi bi-inbox display-1 d-block mb-3 text-muted"></i>
              <h4 className="text-muted">{t("empty.title")}</h4>
              <p className="text-muted">{t("empty.text")}</p>
            </Alert>
          </Col>
        </Row>
      ) : (
        <Row className="g-3">
          {messages.map((message) => (
            <Col key={message.id} xs={12} md={6} lg={4}>
              <div
                style={{
                  opacity: deleting === message.id ? 0.5 : 1,
                  transition: "opacity 0.3s ease",
                }}
              >
                <ContactMessageCard message={message} onDelete={handleDelete} />
              </div>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

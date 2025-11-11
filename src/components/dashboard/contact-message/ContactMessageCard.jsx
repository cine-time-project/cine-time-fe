"use client";

import { Card, Button, Badge } from "react-bootstrap";
import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { useLocale } from "next-intl";

/**
 * Contact Message Card Component
 * Displays individual contact message with compact layout
 */
export const ContactMessageCard = ({ message, onDelete }) => {
  const t = useTranslations("dashboard.contactMessages");
  const locale = useLocale();

  // Format date to relative time
  const getTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: locale === "tr" ? tr : enUS,
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="contact-message-card mb-3 h-100">
      <Card.Body className="d-flex flex-column">
        {/* Header with Time and ID */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <small className="text-muted fw-medium">
            {getTimeAgo(message.createdAt)}
          </small>
          <Badge bg="secondary" className="fs-7 px-2">
            #{message.id}
          </Badge>
        </div>

        {/* From Section */}
        <div className="mb-3">
          <div className="label-section mb-1">
            <span className="label-text">{t("fromLabel").toUpperCase()}</span>
          </div>
          <h5 className="sender-name mb-0">{message.fullName}</h5>
        </div>

        {/* Subject Section */}
        <div className="mb-3">
          <div className="label-section mb-1">
            <span className="label-text">
              {t("subjectLabel").toUpperCase()}
            </span>
          </div>
          <h6 className="subject-text mb-0">{message.subject}</h6>
        </div>

        {/* Contact Information */}
        <div className="contact-section mb-3">
          <div className="contact-item mb-1">
            <i className="bi bi-envelope text-muted me-2"></i>
            <a
              href={`mailto:${message.email}?subject=Re: ${message.subject}`}
              className="contact-link text-decoration-none"
              title={`${message.email} adresine email gönder`}
            >
              {message.email}
            </a>
          </div>
          <div className="contact-item">
            <i className="bi bi-telephone text-muted me-2"></i>
            <a
              href={`tel:${message.phoneNumber}`}
              className="contact-link text-decoration-none"
              title={`${message.phoneNumber} numarasını ara`}
            >
              {message.phoneNumber}
            </a>
          </div>
        </div>

        {/* Message Section */}
        <div className="message-section mb-3 flex-grow-1">
          <div className="label-section mb-2">
            <span className="label-text">
              {t("messageLabel").toUpperCase()}
            </span>
          </div>
          <div className="message-content">
            <p className="message-text mb-0">{message.message}</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="action-section mt-auto">
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => onDelete(message)}
            className="delete-btn w-100"
          >
            <i className="bi bi-trash me-2"></i>
            {t("deleteButton")}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

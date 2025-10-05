"use client";

import { Card } from "react-bootstrap";
import { Map } from "./Map";
import "./contact.scss";
import { ContactForm } from "./ContactForm";
import { ContactMenu } from "../layout/ContactMenu";
import { useTranslations } from "next-intl";

export const Contact = () => {
  const t = useTranslations("contact");

  return (
    <div className="contact">
      <Card>
        <Card.Body>
          <h3>{t("title")}</h3>
          <p>{t("subtitle")}</p>
          <div className="contact-row">
            <ContactForm />
            <ContactMenu />
          </div>
        </Card.Body>
      </Card>

      <Map />
    </div>
  );
};

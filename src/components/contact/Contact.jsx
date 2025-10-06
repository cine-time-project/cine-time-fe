"use client";

import { Card } from "react-bootstrap";
import { Map } from "./Map";
import "./contact.scss";
import { ContactForm } from "./ContactForm";
import { ContactMenu } from "../layout/ContactMenu";
import { useTranslations } from "next-intl";
import WhatsAppFab from "./WhatsAppFab";
import SectionTitle from "../common/SectionTitle";
import ContactHero from "./_ContactHero";


export const Contact = () => {
  const t = useTranslations("contact");

  return (
    <div className="contact">
      <Card>
        <Card.Body>  <ContactHero/>
          <SectionTitle level={2}>{t("title")}</SectionTitle>
        
          <p>{t("subtitle")}</p>
          <div className="contact-row">
            <ContactForm />
            <ContactMenu />
          </div>
        </Card.Body>
      </Card>

      <Map />
      <WhatsAppFab/>
    </div>
  );
};

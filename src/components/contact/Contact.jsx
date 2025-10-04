"use client";

import { Card } from "react-bootstrap";

import { Map } from "./Map";
import "./contact.scss";
import { ContactForm } from "./ContactForm";
import { ContactMenu } from "../layout/ContactMenu";

export const Contact = () => {
  return (
    <div className="contact">
      <Card>
        <Card.Body>
          <h3>Get In Touch</h3>
          <p>
            Were here to help! Whether you have a question, need support, or
            just want to learn more about what we do, feel free to reach out.
            Our team is dedicated to providing quick and reliable responses to
            all inquiries. Simply fill out the form below or use any of the
            contact details provided, and we`ll get back to you as soon as
            possible. We look forward to connecting with you!
          </p>
          <div className="contact-row">

            <ContactForm/>
           <ContactMenu/>
          </div>
        </Card.Body>
      </Card>

      <Map />
    </div>
  );
};

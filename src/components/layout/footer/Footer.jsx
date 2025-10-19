"use client";
import { Container, Row, Col } from "react-bootstrap";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import FooterLinks from "./FooterLinks";
import PremiumCinemas from "./PremiumCinemas";
import ContactSocial from "./ContactSocial";
import NewsletterApp from "./NewsletterApp";
import StickyBuyBar from "./StickyBuyBar";
import "./footer.scss";
import "@/styles/sticky-ticketbar.scss";
import "primeicons/primeicons.css";

export default function Footer() {
  const pathname = usePathname() || "/";
  const tFooter = useTranslations("footer");

  const locale = pathname.split("/")[1] || "tr";
  const L = (rest = "") =>
    rest ? `/${locale}/${rest.replace(/^\/+/, "")}` : `/${locale}`;

  const segments = pathname.split("/").filter(Boolean);
  const isMainDashboard = segments.length === 0 || segments.length === 1;

  useEffect(() => {
    if (isMainDashboard) {
      document.body.classList.add("has-sticky-buybar");
      return () => document.body.classList.remove("has-sticky-buybar");
    }
  }, [isMainDashboard]);

  return (
    <>
      <footer className="footer-dark">
        <Container>
          {/* 4 sütun tek satırda */}
          <Row className="footer-row flex-nowrap">
            <Col lg={3} md={6}>
              <FooterLinks L={L} tFooter={tFooter} />
            </Col>
            <Col lg={3} md={6}>
              <PremiumCinemas L={L} tFooter={tFooter} />
            </Col>
            <Col lg={3} md={6}>
              <ContactSocial L={L} tFooter={tFooter} />
            </Col>
            <Col lg={3} md={6}>
              <NewsletterApp tFooter={tFooter} />
            </Col>
          </Row>

          <hr />
          <Row>
            <Col className="text-center">
              <p>
                © {new Date().getFullYear()} {tFooter("legal.rights")}
              </p>
            </Col>
          </Row>
        </Container>
      </footer>

      {isMainDashboard && <StickyBuyBar />}
    </>
  );
}

"use client";
import Link from "next/link";
import { Container, Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import "./Footer.scss";
import "primeicons/primeicons.css";

export default function Footer() {
  const pathname = usePathname() || "/";
  const locale = pathname.split("/")[1] || "tr";
  const L = (rest = "") =>
    rest ? `/${locale}/${rest.replace(/^\/+/, "")}` : `/${locale}`;
  const tFooter = useTranslations("footer");

  return (
    <footer className="footer-dark">
      <Container>
        <Row className="footer-row">
          {/* Hızlı Linkler */}
          <Col md={3} className="footer-col">
            <h5>{tFooter("sections.quickLinks.title")}</h5>
            <ul>
              <li>
                <Link href={L()}>{tFooter("links.home")}</Link>
              </li>
              <li>
                <Link href={L("movies")}>{tFooter("links.movies")}</Link>
              </li>
              <li>
                <Link href={L("cinemas")}>{tFooter("links.cinemas")}</Link>
              </li>
              <li>
                <Link href={L("campaigns")}>{tFooter("links.campaigns")}</Link>
              </li>
              <li>
                <Link href={L("events")}>{tFooter("links.events")}</Link>
              </li>
              <li>
                <Link href={L("about")}>{tFooter("links.about")}</Link>
              </li>
            </ul>
          </Col>

          {/* Ayrıcalıklı Salonlar */}
          <Col md={3} className="footer-col">
            <h5>{tFooter("sections.premiumCinemas.title")}</h5>
            <ul>
              <li>
                <Link href={L("cinemas/vip")}>{tFooter("premium.vip")}</Link>
              </li>
              <li>
                <Link href={L("cinemas/imax")}>{tFooter("premium.imax")}</Link>
              </li>
              <li>
                <Link href={L("cinemas/4dx")}>{tFooter("premium.fourdx")}</Link>
              </li>
              <li>
                <Link href={L("cinemas/dolby")}>
                  {tFooter("premium.dolby")}
                </Link>
              </li>
              <li>
                <Link href={L("cinemas/family")}>
                  {tFooter("premium.family")}
                </Link>
              </li>
            </ul>
          </Col>

          {/* İletişim */}
          <Col md={3} className="footer-col">
            <h5>{tFooter("sections.contact.title")}</h5>
            <ul>
              <li>📍 {tFooter("contact.address")}</li>
              <li>📞 {tFooter("contact.phone")}</li>
              <li>✉️ {tFooter("contact.email")}</li>
            </ul>

            {/* Sosyal Medya */}
            <h5 className="follow-us-title">
              {tFooter("sections.social.title")}
            </h5>
            <div className="social-icons mt-3">
              <a href="#">
                <i className="pi pi-facebook"></i>
              </a>
              <a href="#">
                <i className="pi pi-instagram"></i>
              </a>
              <a href="#">
                <i className="pi pi-twitter"></i>
              </a>
              <a href="#">
                <i className="pi pi-youtube"></i>
              </a>
            </div>
          </Col>

          {/* Film Haberleri + Uygulama */}
          <Col md={3} className="footer-col">
            <h5>{tFooter("sections.newsletter.title")}</h5>
            <p>{tFooter("sections.newsletter.description")}</p>
            <Form className="newsletter-form">
              <InputGroup>
                <Form.Control
                  type="email"
                  placeholder={tFooter("newsletter.placeholder")}
                />
                <Button variant="danger" type="submit">
                  {tFooter("newsletter.button")}
                </Button>
              </InputGroup>
            </Form>
            <div className="app-buttons mt-3">
              <a href="#">
                <Image
                  src="/images/appstore.png"
                  alt="App Store"
                  width={150}
                  height={45}
                  priority
                />
              </a>
              <a href="#">
                <Image
                  src="/images/googleplay.png"
                  alt="Google Play"
                  width={150}
                  height={45}
                  priority
                />
              </a>
            </div>
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
  );
}

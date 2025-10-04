"use client";
import Link from "next/link";
import { Container, Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import Image from "next/image";
import "./Footer.scss";

export default function Footer() {
  return (
    <footer className="footer-dark">
      <Container>
        <Row className="footer-row">
          {/* Hızlı Linkler */}
          <Col md={3} className="footer-col">
            <h5>Hızlı Linkler</h5>
            <ul>
              <li>
                <Link href="/">Anasayfa</Link>
              </li>
              <li>
                <Link href="/filmler">Filmler</Link>
              </li>
              <li>
                <Link href="/vizyondakiler">Vizyondakiler</Link>
              </li>
              <li>
                <Link href="/kampanyalar">Kampanyalar</Link>
              </li>
              <li>
                <Link href="/etkinlikler">Etkinlikler</Link>
              </li>
              <li>
                <Link href="/hakkimizda">Hakkımızda</Link>
              </li>
            </ul>
          </Col>

          {/* İletişim */}
          <Col md={3} className="footer-col">
            <h5>İletişim</h5>
            <ul>
              <li>📍 İstanbul, Türkiye</li>
              <li>📞 +90 212 123 45 67</li>
              <li>✉️ info@cinetime.com</li>
            </ul>
          </Col>

          {/* Film Haberleri + Sosyal Medya */}
          <Col md={3} className="footer-col">
            <h5>Film Haberleri</h5>
            <p>
              En yeni vizyon filmlerinden ve özel kampanyalardan ilk siz
              haberdar olun.
            </p>
            <Form className="newsletter-form">
              <InputGroup>
                <Form.Control
                  type="email"
                  placeholder="E-posta adresinizi girin"
                />
                <Button variant="danger" type="submit">
                  Abone Ol
                </Button>
              </InputGroup>
            </Form>
            <div className="social-icons">
              <a href="#" className="facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="instagram">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="twitter">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#" className="youtube">
                <i className="bi bi-youtube"></i>
              </a>
            </div>
          </Col>

          {/* Mobil Uygulamalar */}
          <Col md={3} className="footer-col">
            <h5>CineTime Mobil</h5>
            <div className="app-buttons">
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
            <p>© {new Date().getFullYear()} CineTime. Tüm hakları saklıdır.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

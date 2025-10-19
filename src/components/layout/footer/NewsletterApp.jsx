import { Form, Button, InputGroup } from "react-bootstrap";
import Image from "next/image";

export default function NewsletterApp({ tFooter }) {
  return (
    <div className="footer-col">
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
    </div>
  );
}

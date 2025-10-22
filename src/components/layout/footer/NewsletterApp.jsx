import { Form, Button, InputGroup } from "react-bootstrap";
import Image from "next/image";

export default function NewsletterApp({ tFooter }) {
  return (
    <div className="footer-col">
      <h5>{tFooter("sections.newsletter.title")}</h5>
      <p>{tFooter("sections.newsletter.description")}</p>
      <Form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
        <InputGroup>
          <Form.Control
            type="email"
            placeholder={tFooter("newsletter.placeholder")}
            aria-label="E-posta adresi"
          />
          <Button variant="danger" type="submit">
            {tFooter("newsletter.button")}
          </Button>
        </InputGroup>
      </Form>

      <div className="app-buttons mt-3">
        {/* App Store */}
        <a
          href="/coming-soon/appstore"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/images/appstore.png"
            alt="Download on the App Store"
            width={150}
            height={45}
            priority
          />
        </a>

        {/* Google Play */}
        <a
          href="/coming-soon/googleplay"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/images/googleplay.png"
            alt="Get it on Google Play"
            width={150}
            height={45}
            priority
          />
        </a>
      </div>
    </div>
  );
}

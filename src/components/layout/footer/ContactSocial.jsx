import Link from "next/link";

export default function ContactSocial({ L, tFooter }) {
  return (
    <div className="footer-col">
      <h5 className="mb-3">
        <Link href={L("contact")} className="text-reset text-decoration-none">
          {tFooter("sections.contact.title")}
        </Link>
      </h5>
      <ul>
        <li>📍 {tFooter("contact.address")}</li>
        <li>📞 {tFooter("contact.phone")}</li>
        <li>✉️ {tFooter("contact.email")}</li>
      </ul>

      <h5 className="follow-us-title">{tFooter("sections.social.title")}</h5>
      <div className="social-icons mt-3">
        <a
          href="https://www.facebook.com/CineTimeTR"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <i className="pi pi-facebook"></i>
        </a>
        <a
          href="https://www.instagram.com/cinetime.tr"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <i className="pi pi-instagram"></i>
        </a>
        <a
          href="https://x.com/CineTimeTR"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X (Twitter)"
        >
          <i className="pi pi-twitter"></i>
        </a>
        <a
          href="https://www.youtube.com/@CineTimeTR"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="YouTube"
        >
          <i className="pi pi-youtube"></i>
        </a>
      </div>
    </div>
  );
}

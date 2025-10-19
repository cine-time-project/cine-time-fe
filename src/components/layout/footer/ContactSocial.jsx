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
    </div>
  );
}

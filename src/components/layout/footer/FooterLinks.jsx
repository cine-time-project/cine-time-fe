import Link from "next/link";

export default function FooterLinks({ L, tFooter }) {
  return (
    <div className="footer-col">
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
        <li>
          <Link href={L("contact")}>{tFooter("links.contact")}</Link>
        </li>
      </ul>
    </div>
  );
}

import Link from "next/link";

export default function PremiumCinemas({ L, tFooter }) {
  return (
    <div className="footer-col">
      <h5>{tFooter("sections.premiumCinemas.title")}</h5>
      <ul>
        <li>
          <Link href={L("experiences/vip")}>{tFooter("premium.vip")}</Link>
        </li>
        <li>
          <Link href={L("experiences/imax")}>{tFooter("premium.imax")}</Link>
        </li>
        <li>
          <Link href={L("experiences/4dx")}>{tFooter("premium.fourdx")}</Link>
        </li>
        <li>
          <Link href={L("experiences/dolby-atmos")}>
            {tFooter("premium.dolby")}
          </Link>
        </li>
        <li>
          <Link href={L("experiences/family-lounge")}>
            {tFooter("premium.family")}
          </Link>
        </li>
      </ul>
    </div>
  );
}

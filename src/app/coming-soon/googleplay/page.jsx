"use client";
import Link from "next/link";
import Image from "next/image";
import "@/styles/coming-soon.scss";

export default function GooglePlayComingSoon() {
  return (
    <div className="coming-soon">
      <div className="content">
        <Image
          src="/images/googleplay.png"
          alt="Google Play"
          width={200}
          height={100}
          priority
        />
        <h1>🎬 CineTime Mobil Uygulaması</h1>
        <p>
          CineTime mobil uygulaması çok yakında <strong>Google Play</strong>’de
          yayınlanacaktır. Yeni vizyon filmleri, kampanyalar ve etkinliklerden
          ilk siz haberdar olun!
        </p>
        <Link href="/">Ana Sayfaya Dön</Link>
      </div>
    </div>
  );
}

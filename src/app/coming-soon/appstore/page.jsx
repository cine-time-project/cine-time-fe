"use client";
import Link from "next/link";
import Image from "next/image";
import "@/styles/coming-soon.scss";

export default function AppStoreComingSoon() {
  return (
    <div className="coming-soon">
      <div className="content">
        <Image
          src="/images/appstore.png"
          alt="App Store"
          width={200}
          height={100}
          priority
        />
        <h1>🎬 CineTime Mobil Uygulaması</h1>
        <p>
          CineTime mobil uygulaması çok yakında <strong>App Store</strong>’da
          yayınlanacaktır. Yeni vizyon filmleri, kampanyalar ve etkinliklerden
          ilk siz haberdar olun!
        </p>
        <Link href="/">Ana Sayfaya Dön</Link>
      </div>
    </div>
  );
}

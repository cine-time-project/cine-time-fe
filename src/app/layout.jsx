import "../styles/index.scss";
import Header from "../components/layout/Header";
import Footer from "@/components/layout/Footer";
import "bootstrap-icons/font/bootstrap-icons.css";
import { notFound } from "next/navigation";

const SUPPORTED = ["tr", "en"]; // desteklenen diller

export const metadata = {
  title: "CineTime",
  description:
    "CineTime – En yeni filmleri keşfedin ve sinema biletinizi kolayca alın.",
  keywords: ["sinema", "bilet", "film", "vizyondakiler", "CineTime"],
};


export default function RootLayout({ children, params }) {
  const { locale } = params;
  const key = (locale || "tr").toLowerCase().split("-")[0];

  if (!SUPPORTED.includes(key)) {
    notFound();
  }

  return (
    <html lang={key}>
      <body>
        <div className="page-wrapper">
          <Header currentLocale={key} />
          <main className="content">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

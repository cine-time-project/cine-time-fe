// src/app/layout.jsx
import "../styles/index.scss";
import "@/helpers/axios-setup";

export const metadata = {
  title: "CineTime",
  description:
    "CineTime – En yeni filmleri keşfedin ve sinema biletinizi kolayca alın.",
  keywords: ["sinema", "bilet", "film", "vizyondakiler", "CineTime"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}

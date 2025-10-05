import Header from "@/components/layout/Header";
import "../styles/index.scss";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({ children }) {
  return (
    <html>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

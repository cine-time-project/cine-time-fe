"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import tr from "@/i18n/messages/tr.json";
import en from "@/i18n/messages/en.json";
import de from "@/i18n/messages/de.json";
import fr from "@/i18n/messages/fr.json";

export default function NotFound() {
  const pathname = usePathname();
  const localeMatch = pathname?.match(/^\/(tr|en|de|fr)/);
  const locale = localeMatch ? localeMatch[1] : "tr";
  const messages = { tr, en, de, fr };
  const t = messages[locale]?.notFound || messages.tr.notFound;

  return (
    <div style={styles.wrapper}>
      <div style={styles.spotlight}></div>

      {/* 🎬 404 efekti: ortadaki CineTime logosu */}
      <div style={styles.errorText}>
        <span style={styles.digit}>4</span>
        <div style={styles.logoContainer}>
          <Image
            src="/images/cinetime-logo.png"
            alt="CineTime Logo"
            width={90}
            height={90}
            style={styles.logo}
            priority
          />
        </div>
        <span style={styles.digit}>4</span>
      </div>

      <h1 style={styles.title}>{t.title}</h1>
      <p style={styles.desc}>{t.description}</p>

      <Link
        href={`/${locale}`}
        style={styles.button}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#e0ac00")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = "#ffc107")}
      >
        {t.home}
      </Link>

      <style jsx global>{`
        @keyframes rotateLight {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes glow {
          0% {
            text-shadow: 0 0 10px rgba(255, 193, 7, 0.2),
              0 0 20px rgba(255, 193, 7, 0.2);
          }
          50% {
            text-shadow: 0 0 25px rgba(255, 193, 7, 0.8),
              0 0 40px rgba(255, 193, 7, 0.5);
          }
          100% {
            text-shadow: 0 0 10px rgba(255, 193, 7, 0.2),
              0 0 20px rgba(255, 193, 7, 0.2);
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  wrapper: {
    position: "relative",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0c0c0e",
    backgroundImage:
      "radial-gradient(circle at 50% 30%, rgba(255,193,7,0.08), transparent 70%)",
    color: "#fff",
    fontFamily: "Poppins, Arial, sans-serif",
    textAlign: "center",
    overflow: "hidden",
  },
  spotlight: {
    position: "absolute",
    width: "700px",
    height: "700px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(255,193,7,0.15), rgba(255,193,7,0.04), transparent 70%)",
    filter: "blur(50px)",
    top: "10%",
    left: "50%",
    transform: "translateX(-50%)",
    animation: "rotateLight 30s linear infinite",
  },
  errorText: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10rem",
    fontWeight: "800",
    color: "#ffc107",
    letterSpacing: "0.5rem",
    animation: "glow 3s ease-in-out infinite",
    zIndex: 2,
  },
  digit: {
    padding: "0 10px",
  },
  logoContainer: {
    width: "130px",
    height: "130px",
    borderRadius: "50%",
    backgroundColor: "#111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 25px rgba(255,193,7,0.4)",
    overflow: "hidden",
  },
  logo: {
    objectFit: "contain",
  },
  title: {
    fontSize: "2.2rem",
    fontWeight: "600",
    marginBottom: "10px",
    zIndex: 2,
  },
  desc: {
    fontSize: "1.1rem",
    color: "#ccc",
    maxWidth: "420px",
    marginBottom: "30px",
    zIndex: 2,
  },
  button: {
    backgroundColor: "#ffc107",
    color: "#000",
    padding: "12px 28px",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    boxShadow: "0 0 15px rgba(255,193,7,0.3)",
    zIndex: 2,
    cursor: "pointer",
  },
};

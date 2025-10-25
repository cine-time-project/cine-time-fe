"use client";

import { useState, useEffect } from "react";
import { Modal, Button, Form, ListGroup } from "react-bootstrap";
import { useRouter } from "next/navigation";
import styles from "./locationFinder.module.scss"; // Dark theme SCSS
import { useTranslations } from "next-intl";
import { listCinemas } from "@/services/cinema-service";
import Link from "next/link";

export default function LocationFinder({ L }) {
  const tCinemas = useTranslations("cinemas");
  const router = useRouter();
  const [city, setCity] = useState("Locating...");
  const [showModal, setShowModal] = useState(false);
  const [cinemas, setCinemas] = useState([]);

  // Get user's current location
  useEffect(() => {
    if (!navigator.geolocation) {
      setCity(tCinemas("browserNotSupported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        console.log("✅ Geolocation success:", coords);
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
          );
          const d = await r.json();

          const cityName =
            d.address.city || d.address.town || d.address.state || "";

          console.log("📍 Konum Şehri:", cityName);
          setCity(cityName);

          const cinemaData = await listCinemas({ cityName });
          console.log("🎬 Cinema Data:", cinemaData);

          setCinemas(
            Array.isArray(cinemaData)
              ? cinemaData
              : cinemaData?.returnBody?.content || []
          );
        } catch (err) {
          console.error("❌ Try-catch hatası:", err);
          setCity(tCinemas("noLocation"));
        }
      },
      (err) => {
        console.warn("⚠️ Geolocation hata:", err);
        setCity(tCinemas("noLocPermission"));
      }
    );
  }, []);

  // Handle search or use current location
  const handleFindCinemas = async (type = "search") => {
    let cityName = city;

    if (type === "current") {
      if (!navigator.geolocation) return;

      navigator.geolocation.getCurrentPosition(async ({ coords }) => {
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
          );
          const d = await r.json();
          cityName = d.address.city || d.address.town || d.address.state || "";
          router.push(L(`cinemas?city=${encodeURIComponent(cityName)}`));
          setShowModal(false);
        } catch {}
      });
      return;
    }

    if (cityName) {
      router.push(L(`cinemas?city=${encodeURIComponent(cityName)}`));
      setShowModal(false);
    }
  };

  const handleForwardToCinemaDetail = (cinema) => {
    router.push(L(`cinemas/${cinema.id}`));
    setShowModal(false);
  }

  return (
    <>
      {/* Header location display */}
      <div className={styles.locationSimple} onClick={() => setShowModal(true)}>
        <span className={styles.locationIcon}>
          <i className="pi pi-map-marker"></i>
        </span>
        <span className={styles.locationText}>{city}</span>
      </div>

      {/* Dark theme modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        data-bs-theme="dark"
        className={styles.modalOverlay}
        dialogClassName={styles.modalDialog}
        contentClassName={styles.modalContent}
      >
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title className={styles.modalTitle}>
            {tCinemas("nearbyCinemas")}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className={styles.modalBody}>
          {cinemas.length > 0 ? (
            <div className={styles.scrollContainer}>
              <ListGroup variant="flush" className={styles.cinemaList}>
                {cinemas.map((cinema) => (
                  <ListGroup.Item onClick={() => handleForwardToCinemaDetail(cinema)} key={cinema.id} className={styles.cinemaItem}>
                    {cinema?.name}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          ) : (
            <div className={styles.noCinemas}>{tCinemas("noCinemas")}</div>
          )}
        </Modal.Body>

        <div className={styles.modalFooter}>
          <Button
            className="btn btn-warning"
            onClick={() => handleFindCinemas("current")}
          >
            {tCinemas("findMore")}
          </Button>
        </div>
      </Modal>
    </>
  );
}

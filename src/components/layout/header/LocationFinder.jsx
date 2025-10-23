"use client";

import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useRouter } from "next/navigation";
import styles from "./locationFinder.module.scss"; // Dark theme SCSS
import { useTranslations } from "next-intl";

export default function LocationFinder({ L }) {
  const tCinemas = useTranslations("cinemas");
  const router = useRouter();
  const [city, setCity] = useState("Locating...");
  const [showModal, setShowModal] = useState(false);

  // Get user's current location
  useEffect(() => {
    if (!navigator.geolocation) {
      setCity(tCinemas("browserNotSupported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
          );
          const d = await r.json();
          setCity(
            d.address.city ||
              d.address.town ||
              d.address.state ||
              tCinemas("noLocation")
          );
        } catch {
          setCity(tCinemas("noLocation"));
        }
      },
      () => setCity(tCinemas("noLocPermission"))
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
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{tCinemas("nearbyCinemas")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Current location button */}
          <Button
            className="btn btn-warning"
            onClick={() => handleFindCinemas("current")}
          >
            {tCinemas("findMore")}
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
}

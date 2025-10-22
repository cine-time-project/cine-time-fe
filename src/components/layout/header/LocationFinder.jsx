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
  const [searchCity, setSearchCity] = useState("");

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
    let cityName = searchCity;

    if (type === "current") {
      if (!navigator.geolocation) return;

      navigator.geolocation.getCurrentPosition(async ({ coords }) => {
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
          );
          const d = await r.json();
          cityName =
            d.address.city || d.address.town || d.address.state || "";
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
      <div
        className={styles.locationSimple}
        onClick={() => setShowModal(true)}
      >
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
        dialogClassName={styles.modernModal}
        backdropClassName={styles.modernModalBackdrop}
      >
        <Modal.Header closeButton>
          <Modal.Title>{tCinemas("findCinema")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              handleFindCinemas("search");
            }}
          >
            {/* Search input */}
            <Form.Control
              type="text"
              className={styles.searchInput}
              placeholder={tCinemas("inputPlaceholder")}
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleFindCinemas("search");
                }
              }}
            />
            {/* Search button */}
            <Button
              className={styles.searchButton + " w-100 mt-3"}
              onClick={() => handleFindCinemas("search")}
            >
              {tCinemas("searchCity")}
            </Button>
          </Form>

          {/* Current location button */}
          <Button
            variant="link"
            className={styles.useLocationBtn}
            onClick={() => handleFindCinemas("current")}
          >
            {tCinemas("useCurrentLocation")}
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
}

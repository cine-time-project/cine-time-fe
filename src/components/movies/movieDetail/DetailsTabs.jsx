"use client";

import { useState } from "react";
import MovieDetailsGrid from "./MovieDetailsGrid";
import MovieDetailsPanel from "./MovieDetailsPanel";
import styles from "./details-tabs.module.scss";
import { MovieStripe } from "./related/MovieStripeDP";


export default function DetailsTabs({ movie }) {
  const [tab, setTab] = useState("related"); // "related" | "details"

  return (
    <section className={styles.wrap} aria-label="Movie extra content">
      <div className="container">
        {/* TAB BAR */}
        <div className={styles.tabs} role="tablist" aria-orientation="horizontal">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "related"}
            className={`${styles.tab} ${tab === "related" ? styles.active : ""}`}
            onClick={() => setTab("related")}
          >
            Related
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "details"}
            className={`${styles.tab} ${tab === "details" ? styles.active : ""}`}
            onClick={() => setTab("details")}
          >
            Details
          </button>
        </div>

        {/* PANELS */}
        <div className={styles.panel}>
          {tab === "related" ? (
           <MovieStripe/>
          ) : (
            <MovieDetailsPanel movie={movie} />
          )}
        </div>
      </div>
    </section>
  );
}

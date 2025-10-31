"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import styles from "./page-header.module.scss";


export const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  align = "center",
}) => {
  return (
    <header
      className={`${styles.pageHeader} ${
        align === "center" ? styles.centered : styles.leftAligned
      }`}
    >
      {/* Breadcrumbs (optional) */}
      {breadcrumbs?.length > 0 && (
        <nav className={styles.breadcrumbs}>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className={styles.crumb}>
              {crumb.href ? (
                <a href={crumb.href}>{crumb.label}</a>
              ) : (
                <span>{crumb.label}</span>
              )}
              {i < breadcrumbs.length - 1 && (
                <ChevronRight size={16} className={styles.chevron} />
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Main header text */}
      <div className={styles.texts}>
        <h1 className="fw-bold">{title}</h1>
        {subtitle && <p className="text-secondary">{subtitle}</p>}
      </div>

      {/* Optional right-aligned actions (buttons, filters, etc.) */}
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
};

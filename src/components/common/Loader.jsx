"use client";
import React from "react";

export default function Loader() {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Yükleniyor...</span>
      </div>
    </div>
  );
}

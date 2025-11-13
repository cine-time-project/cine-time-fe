"use client";

import { Tab, Tabs } from "react-bootstrap";
import { Alert } from "react-bootstrap";
import { HallCardForDashboard } from "./HallCardForDashboard";
import React from "react";

export default function HallListForDashboard({
  halls,
  tCinemas,
  isEditMode = false,
  isDashboard = false,
  selectedMovieID,
  selectedDate,
}) {
  // Eğer salon yoksa uyarı göster
  if (!halls?.length) {
    return <Alert variant="warning">{tCinemas("noHalls")}</Alert>;
  }

  return (
    <div>
      <h3 className="fw-bold mb-3 text-light">{tCinemas("halls")}</h3>

      {/* Tabs container */}
      <Tabs
        defaultActiveKey={halls[0]?.id}
        id="hall-tabs"
        className="mb-4 custom-dark-tabs"
        justify
      >
        {halls.map((hall) => (
          <Tab
            key={hall.id}
            eventKey={hall.id}
            title={
              <span>
                🎬 {hall.name}
                {hall.isSpecial && (
                  <span style={{ color: "#ffc107", marginLeft: "5px" }}>★</span>
                )}
              </span>
            }
          >
            <HallCardForDashboard
              hall={hall}
              tCinemas={tCinemas}
              isEditMode={isEditMode}
              isDashboard={isDashboard}
              selectedMovieID={selectedMovieID}
              selectedDate={selectedDate}
            />
          </Tab>
        ))}
      </Tabs>

      {/* Custom dark styling */}
      <style jsx global>{`
        .custom-dark-tabs .nav-tabs {
          border-bottom: 1px solid #333;
        }

        .custom-dark-tabs .nav-item.show .nav-link,
        .custom-dark-tabs .nav-link.active {
          background-color: #2a2a2a;
          color: #fff;
          border-color: #333 #333 #2a2a2a;
        }

        .custom-dark-tabs .nav-link {
          color: #ccc;
          background-color: #1a1a1a;
          border: 1px solid #333;
          margin-right: 5px;
          border-radius: 8px 8px 0 0;
          transition: all 0.3s ease;
        }

        .custom-dark-tabs .nav-link:hover {
          color: #fff;
          background-color: #2e2e2e;
        }

        .tab-content {
          background-color: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 0 0 12px 12px;
          padding: 20px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
        }
      `}</style>
    </div>
  );
}

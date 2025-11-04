"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Badge,
  Modal,
} from "react-bootstrap";
import { ImageToolbar } from "./ImageToolbar";
import styles from "./ImageList.module.scss";

export const ImageList = ({
  data,
  locale,
  isAdmin = false,
  onPageChange,
  onSearch,
  onFilter,
  onDeleted,
}) => {
  const router = useRouter();
  const t = useTranslations("images");
  const tCommon = useTranslations("common");
  const [searchTerm, setSearchTerm] = useState("");
  const [movieFilter, setMovieFilter] = useState("");
  const [showButton, setShowButton] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handlePage = (e) => {
    const nextPage = e.page;
    onPageChange?.(nextPage);
  };

  const onClick = (search) => {
    setShowButton(true);
    onSearch(search);
  };

  const page = data?.returnBody ?? data ?? {};
  const { content = [], size = 12, totalElements = 0, number = 0 } = page;

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <h3 className="m-0 fw-semibold text-dark">{t("title")}</h3>
      {isAdmin && (
        <Link
          href={`/${locale}/admin/images/new`}
          className="btn btn-warning text-dark fw-semibold"
        >
          <i className="pi pi-plus me-2" /> {t("uploadNew")}
        </Link>
      )}
    </div>
  );

  const thumbnailTemplate = (row) => {
    const imageUrl = row.url || `/api/images/${row.id}`;

    const handleThumbnailClick = () => {
      setSelectedImage(row);
      setShowImageModal(true);
    };

    return (
      <div
        style={{
          position: "relative",
          display: "inline-block",
          cursor: "pointer",
        }}
        onClick={handleThumbnailClick}
        title={t("clickToPreview")}
      >
        <img
          src={imageUrl}
          alt={row.name}
          width="100"
          height="100"
          style={{
            objectFit: "cover",
            borderRadius: "8px",
            border: "2px solid #ddd",
            transition: "all 0.2s ease",
          }}
          className={styles.thumbnailHover}
          onError={(e) => {
            e.target.src = "/no-image.png";
          }}
        />
        {/* Overlay icon to indicate clickable */}
        <div
          style={{
            position: "absolute",
            top: "5px",
            right: "5px",
            backgroundColor: "rgba(0,0,0,0.7)",
            borderRadius: "50%",
            width: "20px",
            height: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: "0.8",
          }}
        >
          <i
            className="pi pi-search-plus"
            style={{
              color: "white",
              fontSize: "10px",
            }}
          ></i>
        </div>
      </div>
    );
  };

  const nameTemplate = (row) => {
    const handleNameClick = () => {
      setSelectedImage(row);
      setShowImageModal(true);
    };

    return (
      <div>
        <div
          className="fw-semibold text-primary"
          style={{ cursor: "pointer" }}
          onClick={handleNameClick}
          title={t("clickToPreview")}
        >
          {row.name || t("unnamed")}
        </div>
        <small className="text-muted">ID: {row.id}</small>
      </div>
    );
  };

  const movieTemplate = (row) => {
    if (!row.movie) return "-";
    return (
      <div>
        <div>{row.movie.title}</div>
        <small className="text-muted">ID: {row.movie.id}</small>
      </div>
    );
  };

  const typeTemplate = (row) => {
    const type =
      row.type?.split("/")[1]?.toUpperCase() || t("unknown").toUpperCase();
    return <Badge bg="secondary">{type}</Badge>;
  };

  const posterTemplate = (row) =>
    row.isPoster ? (
      <Badge bg="success">
        <i className="pi pi-star-fill me-1"></i>
        {t("poster")}
      </Badge>
    ) : (
      <Badge bg="light" text="dark">
        {t("no")}
      </Badge>
    );

  const createdAtTemplate = (row) =>
    row.createdAt ? new Date(row.createdAt).toLocaleDateString(locale) : "-";

  const handleClear = () => {
    setSearchTerm("");
    setMovieFilter("");
    onSearch?.("");
    onFilter?.("");
    onPageChange?.(0);
    setShowButton(false);
  };

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <Container>
        {/* Search & Filter bar */}
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          <Form.Control
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onClick(searchTerm);
              }
            }}
            style={{ flex: "1 1 300px", minWidth: "250px" }}
          />

          {/* Search button */}
          <button
            type="button"
            className="btn btn-primary fw-semibold"
            onClick={() => onClick(searchTerm)}
            disabled={searchTerm === "" ? true : false}
          >
            <i className="pi pi-search me-2"></i>
            {t("search")}
          </button>

          <Col md="auto">
            {showButton && (
              <Button variant="outline-secondary" onClick={handleClear}>
                <i className="pi pi-times"></i> {t("showAll")}
              </Button>
            )}
          </Col>
        </div>

        {/* Images Table */}
        <DataTable
          value={content}
          dataKey="id"
          paginator
          rows={size}
          totalRecords={totalElements}
          first={number * size}
          onPage={handlePage}
          lazy
          stripedRows
          showGridlines
          header={header}
          emptyMessage={t("noImagesFound")}
          className="p-datatable-sm"
        >
          <Column
            header="ID"
            body={(row) => row.id}
            style={{ width: "50px", textAlign: "center" }}
          />

          <Column
            header={t("thumbnail")}
            body={thumbnailTemplate}
            style={{ width: "140px", textAlign: "center" }}
          />

          <Column
            field="name"
            header={t("preview")}
            body={nameTemplate}
            style={{ width: "18%" }}
          />

          <Column
            header={t("movie")}
            body={movieTemplate}
            style={{ width: "25%" }}
          />

          <Column
            header={t("type")}
            body={typeTemplate}
            style={{ width: "8%", textAlign: "center" }}
          />

          <Column
            header={t("poster")}
            body={posterTemplate}
            style={{ width: "8%", textAlign: "center" }}
          />

          <Column
            field="createdAt"
            header={t("uploaded")}
            body={createdAtTemplate}
            style={{ width: "12%", textAlign: "center" }}
          />

          {isAdmin && (
            <Column
              header={t("actions")}
              body={(row) => (
                <ImageToolbar
                  row={row}
                  locale={locale}
                  isAdmin={isAdmin}
                  onDeleted={() => onDeleted?.()}
                />
              )}
              style={{ width: "10%", textAlign: "right" }}
            />
          )}
        </DataTable>
      </Container>

      {/* Image Preview Modal */}
      <Modal
        show={showImageModal}
        onHide={() => setShowImageModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedImage?.name || t("imagePreview")}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedImage && (
            <div>
              <img
                src={selectedImage.url || `/api/images/${selectedImage.id}`}
                alt={selectedImage.name}
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                }}
                onError={(e) => {
                  e.target.src = "/no-image.png";
                }}
              />
              <div className="mt-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{t("movie")}:</strong>{" "}
                    {selectedImage.movie?.title || t("unknown")}
                  </div>
                  <div>
                    {selectedImage.isPoster ? (
                      <Badge bg="success">
                        <i className="pi pi-star-fill me-1"></i>
                        {t("poster")}
                      </Badge>
                    ) : (
                      <Badge bg="secondary">{t("backdrop")}</Badge>
                    )}
                  </div>
                </div>
                <div className="text-muted mt-2">
                  <small>
                    ID: {selectedImage.id} | {t("type")}:{" "}
                    {selectedImage.type?.split("/")[1]?.toUpperCase() ||
                      t("unknown").toUpperCase()}{" "}
                    | {t("size")}:{" "}
                    {selectedImage.size
                      ? `${(selectedImage.size / 1024).toFixed(2)} KB`
                      : t("unknown")}
                  </small>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImageModal(false)}>
            {t("close")}
          </Button>
          {selectedImage && (
            <Button
              variant="primary"
              onClick={() => {
                const link = document.createElement("a");
                link.href =
                  selectedImage.url || `/api/images/${selectedImage.id}`;
                link.download =
                  selectedImage.name || `image-${selectedImage.id}`;
                link.click();
              }}
            >
              <i className="pi pi-download me-2"></i>
              {t("download")}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

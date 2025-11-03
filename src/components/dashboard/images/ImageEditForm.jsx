"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Form, Card, Alert, Badge, Spinner } from "react-bootstrap";
import { updateImageAction } from "@/action/image-actions";
import { FormContainer } from "@/components/common/form-fields/FormContainer";
import { BackButton } from "@/components/common/form-fields/BackButton";
import { SubmitButton } from "@/components/common/form-fields/SubmitButton";
import { swAlert } from "@/helpers/sweetalert";
import { getToken } from "@/lib/utils/http";

export const ImageEditForm = ({ image, locale }) => {
  const router = useRouter();
  const t = useTranslations("images.edit");
  const tCommon = useTranslations("common");
  const [state, action, isPending] = useActionState(updateImageAction, null);
  const [token, setToken] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isPoster, setIsPoster] = useState(image.isPoster || false);
  const [posterChanged, setPosterChanged] = useState(false);

  useEffect(() => {
    setToken(getToken());
  }, []);

  useEffect(() => {
    if (state?.message) {
      swAlert(state.message, state.ok ? "success" : "error").then(() => {
        if (state.ok) {
          router.push(`/${locale}/admin/images`);
        }
      });
    }
  }, [state, locale, router]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreview(null);
    }
  };

  const handlePosterChange = (e) => {
    setIsPoster(e.target.checked);
    setPosterChanged(true);
  };

  const handleBack = () => {
    router.push(`/${locale}/admin/images`);
  };

  const imageUrl = image.url || `/api/images/${image.id}`;
  const movieTitle = image.movie?.title || `${t("movieId")} ${image.movie?.id}`;

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-2">
          <h3 className="fw-semibold text-dark mb-0">{t("title")}</h3>
          {image.isPoster && <Badge bg="success">{t("currentPoster")}</Badge>}
        </div>
        <p className="text-muted mb-0">
          {t("imageFor")} <strong>{movieTitle}</strong>
        </p>
      </div>

      <FormContainer>
        <form action={action}>
          {/* Hidden fields */}
          <input type="hidden" name="imageId" value={image.id} />
          <input type="hidden" name="movieId" value={image.movie?.id} />
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="token" value={token} />
          <input
            type="hidden"
            name="poster"
            value={posterChanged ? isPoster.toString() : ""}
          />

          {/* Current Image Info */}
          <Card className="mb-3">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>{t("currentImage")}</span>
              <div className="d-flex gap-2">
                <Badge bg="secondary">ID: {image.id}</Badge>
                <Badge bg="info">
                  {image.type?.split("/")[1]?.toUpperCase() ||
                    t("unknown").toUpperCase()}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body className="text-center">
              <img
                src={imageUrl}
                alt={image.name || t("currentImage")}
                style={{
                  maxWidth: "100%",
                  maxHeight: "300px",
                  objectFit: "contain",
                }}
                onError={(e) => {
                  e.target.src = "/no-image.png";
                }}
              />
              <div className="mt-3 small text-muted">
                <div>
                  <strong>{tCommon("name")}:</strong>{" "}
                  {image.name || t("unnamed")}
                </div>
                <div>
                  <strong>{t("fileType")}:</strong> {image.type || t("unknown")}
                </div>
                {image.createdAt && (
                  <div>
                    <strong>{t("uploaded")}</strong>{" "}
                    {new Date(image.createdAt).toLocaleDateString(locale)}
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* New File Input */}
          <Form.Group className="mb-3">
            <Form.Label>
              {t("replaceImage")}{" "}
              <span className="text-danger">{t("required")}</span>
            </Form.Label>
            <Form.Control
              type="file"
              name="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              required
            />
            <Form.Text className="text-muted">{t("acceptedFormats")}</Form.Text>
          </Form.Group>

          {/* New Image Preview */}
          {preview && (
            <Card className="mb-3">
              <Card.Header>{t("newImagePreview")}</Card.Header>
              <Card.Body className="text-center">
                <img
                  src={preview}
                  alt={t("newImagePreview")}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "400px",
                    objectFit: "contain",
                  }}
                />
                {selectedFile && (
                  <div className="mt-3 small text-muted">
                    <div>
                      <strong>{t("fileName")}</strong> {selectedFile.name}
                    </div>
                    <div>
                      <strong>{t("fileSize")}</strong>{" "}
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </div>
                    <div>
                      <strong>{t("fileType")}</strong> {selectedFile.type}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Poster Toggle */}
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="poster-check"
              label={t("setPoster")}
              checked={isPoster}
              onChange={handlePosterChange}
            />
            <Form.Text className="text-muted">
              {isPoster ? t("posterWillBeSet") : t("posterWillNotBeUsed")}
            </Form.Text>
          </Form.Group>

          {/* Warning if changing poster status */}
          {posterChanged && (
            <Alert variant="warning" className="mb-3">
              <i className="pi pi-exclamation-triangle me-2" />
              <strong>{t("posterStatusChanged")}</strong>{" "}
              {isPoster ? t("willBecomePoster") : t("noLongerPoster")}
            </Alert>
          )}

          {/* Info Alert */}
          <Alert variant="info" className="mb-3">
            <i className="pi pi-info-circle me-2" />
            <strong>{tCommon("note")}:</strong> {t("updateNote")}
          </Alert>

          {/* Action Buttons */}
          <div className="d-flex gap-2">
            <BackButton onClick={handleBack} />
            <SubmitButton
              title={t("updateImage")}
              pending={isPending}
              disabled={!selectedFile}
            />
          </div>
        </form>
      </FormContainer>
    </div>
  );
};

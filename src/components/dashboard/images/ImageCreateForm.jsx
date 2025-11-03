"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { uploadImageAction } from "@/action/image-actions";
import { getAllMoviesForSelect } from "@/service/movie-service";
import { FormContainer } from "@/components/common/form-fields/FormContainer";
import { SelectInput } from "@/components/common/form-fields/SelectInput";
import { BackButton } from "@/components/common/form-fields/BackButton";
import { SubmitButton } from "@/components/common/form-fields/SubmitButton";
import { swAlert } from "@/helpers/sweetalert";
import { getToken } from "@/lib/utils/http";
import { Form, Card, Alert } from "react-bootstrap";

export const ImageCreateForm = ({ locale }) => {
  const router = useRouter();
  const t = useTranslations("images.new");
  const tCommon = useTranslations("common");
  const [state, action, isPending] = useActionState(uploadImageAction, null);
  const [token, setToken] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isPoster, setIsPoster] = useState(false);
  const [movieOptions, setMovieOptions] = useState([]);
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setToken(getToken());
  }, []);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setLoading(true);
        const movies = await getAllMoviesForSelect();
        setMovieOptions(
          movies.map((m) => ({
            label: `${m.title} (ID: ${m.id})`,
            value: m.id,
          }))
        );
      } catch (err) {
        console.error("Failed to load movies:", err);
        swAlert(t("failedToLoadMovies"), "error");
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
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

  const handleBack = () => {
    router.push(`/${locale}/admin/images`);
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded shadow-sm">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{tCommon("loading")}</span>
          </div>
          <p className="mt-3">{t("loadingMovies")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <div className="mb-4">
        <h3 className="fw-semibold text-dark">{t("title")}</h3>
        <p className="text-muted mb-0">{t("description")}</p>
      </div>

      <FormContainer>
        <form action={action}>
          {/* Hidden fields */}
          <input type="hidden" name="movieId" value={selectedMovieId} />
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="poster" value={isPoster.toString()} />

          {/* Movie Selection */}
          <SelectInput
            name="movieSelect"
            label={t("selectMovieRequired")}
            className="mb-3"
            value={selectedMovieId}
            onChange={(e) => setSelectedMovieId(e.target.value)}
            options={movieOptions}
            optionLabel="label"
            optionValue="value"
            errorMessage={state?.errors?.movieId}
            required
          />

          {/* File Input */}
          <Form.Group className="mb-3">
            <Form.Label>
              {t("selectImageFile")}{" "}
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

          {/* Image Preview */}
          {preview && (
            <Card className="mb-3">
              <Card.Header>{t("preview")}</Card.Header>
              <Card.Body className="text-center">
                <img
                  src={preview}
                  alt={t("preview")}
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

          {/* Poster Checkbox */}
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="poster-check"
              label={t("setPoster")}
              checked={isPoster}
              onChange={(e) => setIsPoster(e.target.checked)}
            />
            <Form.Text className="text-muted">
              {isPoster ? t("posterWillBeSet") : t("posterCheckInfo")}
            </Form.Text>
          </Form.Group>

          {/* Info Alert */}
          <Alert variant="info" className="mb-3">
            <i className="pi pi-info-circle me-2" />
            <strong>{t("noteTitle")}</strong> {t("noteText")}
          </Alert>

          {/* Warning if no movie selected */}
          {!selectedMovieId && (
            <Alert variant="warning" className="mb-3">
              <i className="pi pi-exclamation-triangle me-2" />
              {t("selectMovieWarning")}
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="d-flex gap-2">
            <BackButton onClick={handleBack} />
            <SubmitButton
              title={t("uploadImage")}
              pending={isPending}
              disabled={!selectedFile || !selectedMovieId}
            />
          </div>
        </form>
      </FormContainer>
    </div>
  );
};

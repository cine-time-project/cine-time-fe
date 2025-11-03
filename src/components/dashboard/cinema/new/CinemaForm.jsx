import { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import Swal from "sweetalert2";
import { createCinemaRequest } from "@/service/cinema-service";
import { CountrySelect } from "./CountrySelect";
import { CitySelect } from "./CitySelect";
import { CardGroup } from "./ui/CardGroup";
import { Card, Col, Row } from "react-bootstrap";
import { CinemaImageUploader } from "./CinemaImageUploader";

export function CinemaForm(props) {
  const { cinema, token, isEditMode } = props;
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");

  useEffect(() => {
    if (cinema && Object.keys(cinema).length > 0) {
      setName(cinema.name || "");
      setSlug(cinema.slug || "");
      setSelectedCountryId(cinema.city?.countryMiniResponse?.id || "");
      setSelectedCityId(cinema.city?.id || "");
    } else {
      // Eğer yeni ekleme işlemi ise formu sıfırla
      setName("");
      setSlug("");
      setSelectedCountryId("");
      setSelectedCityId("");
    }
  }, [cinema]);

  const handleSubmit = async () => {
    if (!name.trim())
      return Swal.fire("Error", "Cinema name required", "error");
    if (!selectedCityId) return Swal.fire("Error", "Select a city", "error");

    try {
      if (isEditMode) {
        await updateCinemaRequest(
          { id: cinema.id, name, slug, cityId: selectedCityId },
          token
        );
        Swal.fire("Success", "Cinema updated successfully!", "success");
      } else {
        console.log("selectedCityId: " , selectedCityId);
        await createCinemaRequest(
          { name, slug, cityId: selectedCityId },
          token
        );
        Swal.fire("Success", "Cinema created successfully!", "success");
        setName("");
        setSlug("");
        setSelectedCityId("");
        setSelectedCountryId("");
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    }
  };

  return (
    <div className="container py-4 bg-secondary-subtle">
      <Row>
        <Col md={6}>
          <CardGroup title="Cinema Information">
            <div className="mb-3">
              <label className="form-label fw-semibold">Cinema Name</label>
              <InputText
                value={name || ""}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter cinema name"
                className="w-100"
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Slug (optional)</label>
              <InputText
                value={slug || ""}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Enter slug or leave blank"
                className="w-100"
              />
            </div>
            <CountrySelect
              selectedCountryId={selectedCountryId}
              onCountryChange={setSelectedCountryId}
              token={token}
            />
            <div className="mt-4">
              <CitySelect
                selectedCountryId={selectedCountryId}
                selectedCityId={selectedCityId}
                onCityChange={setSelectedCityId}
                token={token}
              />
            </div>
            <Button
              label={isEditMode ? "Update Cinema" : "Create Cinema"}
              icon={isEditMode ? "pi pi-refresh" : "pi pi-check"}
              severity={isEditMode ? "info" : "success"}
              onClick={handleSubmit}
              className="px-4"
            />
          </CardGroup>
        </Col>
        <Col md={6}>
          <CinemaImageUploader
            //cinema={{ id: newCinemaId }}
            cinema={cinema} // { id: 5, imageUrl: "..."}
            isEditMode={false}
            onUpload={async (id, file) => {
              const formData = new FormData();
              formData.append("image", file);
              await axios.post(`/api/cinemas/${id}/upload-image`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
              });
            }}
          />

          {/* <Card.Img
            src={cinema?.imageUrl}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          /> */}
        </Col>
      </Row>
    </div>
  );
}

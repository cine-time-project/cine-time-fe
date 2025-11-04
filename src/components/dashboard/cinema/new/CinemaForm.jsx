import { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import Swal from "sweetalert2";
import { createCinemaRequest } from "@/service/cinema-service";
import { CountrySelect } from "./CountrySelect";
import { CitySelect } from "./CitySelect";
import { CardGroup } from "./ui/CardGroup";
import { useRouter } from "next/navigation";
import { Col, Form, Row } from "react-bootstrap";

export function CinemaForm(props) {
  const { cinema, token, locale, isEditMode } = props;
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedCityId, setSelectedCityId] = useState("");

  const router = useRouter();

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
        const res = await createCinemaRequest(
          { name, slug, cityId: selectedCityId },
          token
        );
        console.log(res);
        const createdCinemaId = res?.returnBody?.id;
        Swal.fire("Success", "Cinema created successfully!", "success");
        router.push(
          createdCinemaId
            ? `/${locale}/admin/cinemas/${createdCinemaId}`
            : `/${locale}/admin/cinemas/`
        );
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    }
  };

  return (
    <CardGroup title="Cinema Information">
      <Form.Group className="mb-3" as={Row}>
        <Form.Label column sm="2" className="mx-0">
          Name:
        </Form.Label>
        <Col sm="10">
          <Form.Control
            value={name || ""}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter cinema name"
            className="w-100"
          />
        </Col>
      </Form.Group>

      <Form.Group className="mb-3" as={Row}>
        <Form.Label column sm="2" className="mx-0">
          Slug
        </Form.Label>
        <Col sm="10">
          <Form.Control
            value={slug || ""}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Enter slug or leave blank"
            className="w-100"
          />
        </Col>
      </Form.Group>
      
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
  );
}

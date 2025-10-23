import { config } from "@/helpers/config";
import axios from "axios";

// Fetch cinemas from backend
export async function listCinemas({
  cityId,
  cityName,
  specialHall,
  page = 0,
  size = 8,
}) {
  const res = await axios.get(`${config.apiURL}/cinemas`, {
    params: { cityId, cityName, specialHall, page, size },
    validateStatus: () => true,
  });

  if (res.status !== 200 || !res.data) {
    console.error("Cinema API error:", res);
    throw new Error(res.data?.message || "Failed to fetch cinemas");
  }

  return res.data; // burada returnBody’yi almadık, üstte handle edeceğiz
}

// Convert city name to coordinates
export const getCoordsByCity = async (cityName) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?city=${cityName}&format=json&limit=1`
  );
  const data = await res.json();
  if (data?.length > 0)
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  return null;
};

export async function listCinemas({
  cityId,
  cityName,
  specialHall,
  page = 0,
  size = 10,
}) {
  const params = new URLSearchParams();
  if (cityId) params.append("cityId", cityId);
  if (cityName) params.append("cityName", cityId);
  if (specialHall) params.append("specialHall", specialHall);
  params.append("page", page);
  params.append("size", size);

  const res = await fetch(`/api/cinemas?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch cinemas");
  return res.json();
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

 

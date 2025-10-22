export async function listCinemas({ cityId, specialHall, page = 0, size = 10 }) {
  const params = new URLSearchParams();
  if (cityId) params.append("cityId", cityId);
  if (specialHall) params.append("specialHall", specialHall);
  params.append("page", page);
  params.append("size", size);

  const res = await fetch(`/api/cinemas?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch cinemas");
  return res.json();
}

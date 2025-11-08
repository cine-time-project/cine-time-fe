import axios from "axios";
import { config } from "@/helpers/config";

export async function getAllCinemas(page = 0, size = 50, token) {
  try {
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await axios.get(
      `${config.apiURL}/cinemas?page=${page}&size=${size}`,
      {
        headers,
      }
    );
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || "Cinema fetch failed";
    throw new Error(msg);
  }
}

/**
 * Delete cinemas from the backend.
 * Supports both single ID and multiple IDs.
 */
export async function deleteCinemas(ids, token) {
  // Ensure ids is always an array
  const idArray = Array.isArray(ids) ? ids : [ids];

  try {
    const response = await axios.delete(`${config.apiURL}/cinemas`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Include JWT token for backend auth
      },
      data: idArray, // Axios DELETE requires body to be sent via 'data'
    });

    // Return the backend response
    return response.data;
  } catch (error) {
    // Extract message from backend or use a default error message
    const msg = error.response?.data?.message || "Cinema delete failed";
    throw new Error(msg);
  }
}

//Fetch all cities for New Cinema Creation
export async function getAllCities() {
  try {
    const response = await axios.get(`${config.apiURL}/cities/listAllCities`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Return the backend response
    return response.data;
  } catch (error) {
    // Extract message from backend or use a default error message
    const msg = error.response?.data?.message || "City Fetch failed";
    throw new Error(msg);
  }
}

export async function createCinemaRequest(data, token) {
  if (!token) throw new Error("Missing token");

  // data = { name, slug, cityId, districtIds?, newCityName?, newCountryId?, imageUrl? }
  const response = await axios.post(
    `${config.apiURL}/cinemas`, // backend endpoint
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`, // Direkt Bearer token ekledik
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}

export async function getDetailedCinema(id) {
  const response = await axios.get(
    `${config.apiURL}/cinemas/${id}/detail`
    // {
    //   headers: {
    //     Authorization: `Bearer ${token}`, // Direkt Bearer token ekledik
    //     "Content-Type": "application/json",
    //   },
    // } // backend endpoint
  );
  console.log(response?.data?.returnBody);
  return response?.data?.returnBody;
}

export async function updateCinemaRequest(id, data, token) {
  if (!token) throw new Error("Missing token");

  // data = { name, slug, cityId, districtIds?, newCityName?, newCountryId?, imageUrl? }
  const response = await axios.put(
    `${config.apiURL}/cinemas/${id}`, // backend endpoint
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`, // Direkt Bearer token ekledik
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}

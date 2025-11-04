import axios from "axios";
import { config } from "@/helpers/config";

/**
 * Delete cinemas from the backend.
 * Supports both single ID and multiple IDs.
 *
 * @param {number|number[]} ids - Single cinema ID or an array of cinema IDs to delete
 * @param {string} token - JWT token for Authorization header
 * @returns {Promise<Object>} - Response object from backend { httpStatus, message, returnBody }
 * @throws {Error} - Throws error if deletion fails
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

export async function getDetailedCinema(id, token) {
  const response = await axios.get(
    `${config.apiURL}/dashboard/cinemas/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`, // Direkt Bearer token ekledik
        "Content-Type": "application/json",
      },
    } // backend endpoint
  );
  return response?.data?.returnBody;
}

//TODO: this is dummy, should be replaced with real one
export async function updateCinemaRequest(id, token) {
  const response = await axios.get(
    `${config.apiURL}/dashboard/cinemas/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`, // Direkt Bearer token ekledik
        "Content-Type": "application/json",
      },
    } // backend endpoint
  );
  return response?.data?.returnBody;
}

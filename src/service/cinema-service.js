import axios from 'axios';
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
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include JWT token for backend auth
      },
      data: idArray, // Axios DELETE requires body to be sent via 'data'
    });

    // Return the backend response
    return response.data;
  } catch (error) {
    // Extract message from backend or use a default error message
    const msg = error.response?.data?.message || 'Cinema delete failed';
    throw new Error(msg);
  }
}

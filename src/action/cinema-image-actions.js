import { uploadCinemaImage } from "@/service/cinema-image-service";

/**
 * Upload cinema image
 * @param {number} cinemaId - ID of the cinema
 * @param {File} file - The image file
 * @param {string} token - JWT token with ADMIN authority
 * @returns {Promise<Object>} - Uploaded image response
 */
export const uploadImage = async (cinemaId, file, token) => {
  const formData = new FormData();
  formData.append("file", file);

  const data = await uploadCinemaImage(cinemaId, formData, token);

  return response.data;
};

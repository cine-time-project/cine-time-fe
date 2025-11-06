import { config } from "@/helpers/config";
import axios from "axios";

export async function uploadCinemaImage(cinemaId, formData, token) {
  if (!token) throw new Error("Missing token");

  // formData = { data, name, type, cinema, url }
   const response = await axios.post(`${config.apiURL}/cinemaimages/${cinemaId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}
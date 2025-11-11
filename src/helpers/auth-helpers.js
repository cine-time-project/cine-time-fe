import { cookies } from "next/headers";

/**
 * Auth header oluşturur - JWT token'ı cookie'den alır
 * @returns {Promise<Object>} Authorization header objesi
 */
export const getAuthHeader = async () => {
  try {
    const cookieStore = await cookies();

    // Cookie'lerden token'ı al (farklı isimleri dene)
    const token =
      cookieStore.get("authToken")?.value || cookieStore.get("token")?.value;

    if (!token) {
      return {
        "Content-Type": "application/json",
      };
    }

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  } catch (error) {
    console.error("Auth header error:", error);
    return {
      "Content-Type": "application/json",
    };
  }
};

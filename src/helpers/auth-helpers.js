import { cookies } from "next/headers";

export const getAuthHeader = async () => {
  // cookies artık async
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    console.warn("⚠️ No auth token found in cookies");
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

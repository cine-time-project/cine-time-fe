import axios from "axios";
import { config } from "@/helpers/config";
import { authHeaders } from "@/lib/utils/http"; // varsa

const API = config.apiURL;

// ---------- SELF-SERVICE (/account) ----------
export async function getMyInfo() {
  const { data } = await axios.get(`${API}/user-information`, { headers: authHeaders() });
  return data;
}

export async function updateMyInfo(payload) {
  const { data } = await axios.put(`${API}/users/auth`, payload, { headers: authHeaders() });
  return data;
}

export async function deleteMyAccount() {
  const { data } = await axios.delete(`${API}/users/auth`, { headers: authHeaders() });
  return data;
}

export async function resetMyPassword(payload) {
  const { data } = await axios.post(`${API}/reset-password`, payload, { headers: authHeaders() });
  return data;
}

// ---------- ADMIN | EMPLOYEE (Dashboard > Users) ----------
export async function searchUsers({ q = "", page = 0, size = 20, sort = "id,ASC" } = {}) {
  const params = { q, page, size, sort };
  const { data } = await axios.get(`${API}/users/admin`, { params, headers: authHeaders() });
  return data; // ResponseMessage<Page<UserResponse>>
}

// Not: BE’de "get all" için tuhaf bir rota var; BE’yi değiştirmeden kullanıyoruz:
export async function getAllUsersLegacy() {
  const { data } = await axios.get(`${API}/users/4/admin`, { headers: authHeaders() });
  return data; // List<UserResponse>
}

// Create: BE şu an POST /users/auth altında (isim kafa karıştırıcı ama BE değişmiyor)
export async function adminCreateUser(payload) {
  const { data } = await axios.post(`${API}/users/auth`, payload, { headers: authHeaders() });
  return data; // ResponseMessage<UserCreateResponse>
}

// Update/Delete: BE rotası prefixsiz: /api/{userId}/admin  --> dikkat!
export async function adminUpdateUser(userId, payload) {
  const { data } = await axios.put(`${API}/${userId}/admin`, payload, { headers: authHeaders() });
  return data; // ResponseMessage<UserResponse>
}

export async function adminDeleteUser(userId) {
  const { data } = await axios.delete(`${API}/${userId}/admin`, { headers: authHeaders() });
  return data; // ResponseMessage<UserResponse>
}

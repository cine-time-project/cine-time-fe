export async function fetchUsers() {
  const base = process.env.NEXT_PUBLIC_API_BASE;

  const res = await fetch(`${base}/users/admin`, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Kullanıcı listesi alınamadı (${res.status})`);
  }

  return res.json();
}

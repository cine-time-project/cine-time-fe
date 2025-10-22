export default function AdminDashboardPage({ params: { locale } }) {
  return (
    <>
      <h1>Admin Dashboard</h1>
      <p>Yönetim özet ekranı. Modüllere soldaki / üstteki menülerden veya /{locale}/dashboard’dan ulaş.</p>
    </>
  );
}

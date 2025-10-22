export default function AdminLayout({ children, params: { locale } }) {
  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
      {children}
    </main>
  );
}

import "../styles/index.scss";




export default function RootLayout({children}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}

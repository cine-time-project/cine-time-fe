// src/app/[locale]/(public)/events/page.jsx

export const metadata = {
  title: "Events",
  description: "Upcoming events at CineTime",
};

export default function EventsPage() {
  return (
    <div className="container py-4">
      <h1>Events</h1>
      <p>Etkinlikler burada listelenecek.</p>
    </div>
  );
}

import { CardGroup } from "../new/ui/CardGroup";

/**
 * CinemaReadOnlyView
 * ------------------
 * Cinema detaylarını sadece görüntüleme modunda gösterir.
 *
 * Props:
 *  - cinema: { name, slug, city, city.countryMiniResponse, imageUrl }
 */
export function CinemaReadOnlyView({ cinema }) {
  if (!cinema) {
    return (
      <div className="container py-4 bg-secondary-subtle text-center">
        <p className="text-muted">No cinema data available.</p>
      </div>
    );
  }

  return (
    <CardGroup title={`Cinema ID: ${cinema.id}`}>
      <div className="mb-3">
        <label className="form-label fw-semibold">Name</label>
        <div className="form-control-plaintext border bg-white rounded px-2 py-1">
          {cinema.name || "-"}
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Slug</label>
        <div className="form-control-plaintext border bg-white rounded px-2 py-1">
          {cinema.slug || "-"}
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Country</label>
        <div className="form-control-plaintext border bg-white rounded px-2 py-1">
          {cinema.city?.countryMiniResponse?.name || "-"}
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">City</label>
        <div className="form-control-plaintext border bg-white rounded px-2 py-1">
          {cinema.city?.name || "-"}
        </div>
      </div>
    </CardGroup>
  );
}

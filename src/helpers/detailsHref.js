export function buildDetailsHref(movie, locale) {
  const prefix = locale ? `/${locale}` : "";
  return movie?.id ? `${prefix}/movies/${movie.id}` : "#";
}
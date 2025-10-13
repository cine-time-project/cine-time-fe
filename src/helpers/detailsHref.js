
export function buildDetailsHref(movie, locale){
  const prefix = locale ? `/${locale}` : "";
  const seg = movie?.slug || movie?.id;
  return seg ? `${prefix}/movies/${seg}` : "#";
}

// Reports need the source page and availability, not short-lived signed parameters.
export function reportUrl(raw) {
  const url = new URL(raw);
  url.username = '';
  url.password = '';
  url.search = '';
  url.hash = '';
  return url.href;
}

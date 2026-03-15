/**
 * Returns the image URL directly.
 * Amazon CDN serves images with access-control-allow-origin: *
 * so no proxy is needed — direct loading is faster and more reliable.
 */
export function proxyImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  return url;
}

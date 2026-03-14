/**
 * Converts an Amazon image URL to use our backend proxy.
 * This avoids hotlinking blocks from Amazon's CDN.
 */
export function proxyImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  
  // Only proxy Amazon URLs
  if (
    url.includes("m.media-amazon.com") ||
    url.includes("images-na.ssl-images-amazon.com") ||
    url.includes("images-eu.ssl-images-amazon.com") ||
    url.includes("ecx.images-amazon.com")
  ) {
    return `/api/img?url=${encodeURIComponent(url)}`;
  }
  
  // Return other URLs as-is
  return url;
}

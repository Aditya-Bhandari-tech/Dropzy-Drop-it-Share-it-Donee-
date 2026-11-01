export interface ShortenedUrl {
  slug: string;
  originalUrl: string;
  createdAt: number;
  clicks: number;
}

const globalUrlStore = global as unknown as {
  __dropzy_urls?: Map<string, ShortenedUrl>;
};

if (!globalUrlStore.__dropzy_urls) {
  globalUrlStore.__dropzy_urls = new Map<string, ShortenedUrl>();

  // Demo shortened URL
  globalUrlStore.__dropzy_urls.set("drop", {
    slug: "drop",
    originalUrl: "https://dropzy.app",
    createdAt: Date.now(),
    clicks: 14,
  });
}

export const urlStore = globalUrlStore.__dropzy_urls;

export function generateShortSlug(length = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let slug = "";
  do {
    slug = "";
    for (let i = 0; i < length; i++) {
      slug += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (urlStore.has(slug));
  return slug;
}

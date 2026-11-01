import { NextResponse } from "next/server";
import { urlStore, generateShortSlug, ShortenedUrl } from "@/lib/urlStore";
import { transfersMap } from "@/lib/transferStore";

// POST /api/shorten
export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { url, customSlug } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, error: "A valid destination URL is required." },
        { status: 400 }
      );
    }

    url = url.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    let slug = customSlug?.trim();
    if (slug) {
      // Validate custom slug
      slug = slug.replace(/[^a-zA-Z0-9-_]/g, "");
      if (urlStore.has(slug) || transfersMap.has(slug)) {
        return NextResponse.json(
          { success: false, error: "Custom slug is already taken. Try another." },
          { status: 409 }
        );
      }
    } else {
      slug = generateShortSlug(6);
    }

    const newRecord: ShortenedUrl = {
      slug,
      originalUrl: url,
      createdAt: Date.now(),
      clicks: 0,
    };

    urlStore.set(slug, newRecord);

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (typeof request.headers.get === "function" && request.headers.get("host")
        ? `${request.headers.get("x-forwarded-proto") || "http"}://${request.headers.get("host")}`
        : "https://dropzy.app");

    return NextResponse.json({
      success: true,
      slug,
      shortUrl: `${baseUrl}/s/${slug}`,
      originalUrl: url,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to shorten URL." },
      { status: 500 }
    );
  }
}

// GET /api/shorten?slug=xyz
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim();

  if (!slug) {
    return NextResponse.json({ success: false, error: "Slug is required" }, { status: 400 });
  }

  const record = urlStore.get(slug);
  if (!record) {
    return NextResponse.json({ success: false, error: "Short URL not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    slug: record.slug,
    originalUrl: record.originalUrl,
    clicks: record.clicks,
  });
}

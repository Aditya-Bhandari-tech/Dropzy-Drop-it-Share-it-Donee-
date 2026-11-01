import { NextResponse } from "next/server";
import { urlStore } from "@/lib/urlStore";
import { transfersMap } from "@/lib/transferStore";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const cleanSlug = slug?.trim();

  if (!cleanSlug) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 1. Check if it's a transfer 6-digit key
  if (transfersMap.has(cleanSlug)) {
    return NextResponse.redirect(new URL(`/share/${cleanSlug}`, request.url));
  }

  // 2. Check if it's a shortened URL
  const record = urlStore.get(cleanSlug);
  if (record) {
    record.clicks += 1;
    return NextResponse.redirect(record.originalUrl, 307);
  }

  // 3. Fallback: redirect home with message
  return NextResponse.redirect(new URL("/?error=link_expired", request.url));
}

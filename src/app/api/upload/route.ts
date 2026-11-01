import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const sendTo = formData.get("sendTo") as string;
    const senderEmail = formData.get("senderEmail") as string;
    const message = formData.get("message") as string;
    const isPrivate = formData.get("isPrivate") === "true";
    const password = formData.get("password") as string | null;

    const files: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key === "files" && value instanceof File) {
        files.push(value);
      }
    }

    const transferId = Math.random().toString(36).substring(2, 9);

    return NextResponse.json({
      success: true,
      transferId,
      shareUrl: `https://dropzy.app/share/${transferId}`,
      fileCount: files.length,
      totalBytes: files.reduce((acc, f) => acc + f.size, 0),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        sendTo,
        senderEmail,
        isPrivate,
        hasPassword: Boolean(password),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to process upload request." },
      { status: 500 }
    );
  }
}

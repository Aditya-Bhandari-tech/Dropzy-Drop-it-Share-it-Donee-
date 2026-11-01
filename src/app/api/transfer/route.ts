import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { transfersMap, generateSixDigitCode, StoredTransfer } from "@/lib/transferStore";

// GET /api/transfer?code=123456
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code")?.trim();

  if (!code || code.length !== 6) {
    return NextResponse.json(
      { success: false, error: "Please enter a valid 6-digit code." },
      { status: 400 }
    );
  }

  const transfer = transfersMap.get(code);

  if (!transfer) {
    return NextResponse.json(
      { success: false, error: "Code not found. Please verify the 6-digit code." },
      { status: 404 }
    );
  }

  // Check if expired
  if (Date.now() > transfer.expiresAt) {
    transfersMap.delete(code);
    return NextResponse.json(
      { success: false, error: "This 6-digit transfer code has expired." },
      { status: 410 }
    );
  }

  return NextResponse.json({
    success: true,
    transfer,
    remainingSeconds: Math.max(0, Math.floor((transfer.expiresAt - Date.now()) / 1000)),
  });
}

// POST /api/transfer (Real multipart file upload & storage)
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let message = "";
    let expiryMinutes = 10;
    const uploadedFiles: { name: string; size: number; type: string }[] = [];

    const code = generateSixDigitCode();
    const uploadDir = path.join(process.cwd(), "uploads", code);
    await fs.mkdir(uploadDir, { recursive: true });

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      message = (formData.get("message") as string) || "";
      const expiry = formData.get("expiryMinutes");
      if (expiry) expiryMinutes = parseInt(expiry as string, 10) || 10;

      for (const [key, value] of formData.entries()) {
        if (key === "files" && value instanceof File) {
          const buffer = Buffer.from(await value.arrayBuffer());
          const safeName = path.basename(value.name);
          const filePath = path.join(uploadDir, safeName);
          await fs.writeFile(filePath, buffer);

          uploadedFiles.push({
            name: safeName,
            size: value.size,
            type: value.type || "application/octet-stream",
          });
        }
      }
    } else {
      // JSON body fallback
      const body = await request.json();
      message = body.message || "";
      expiryMinutes = body.expiryMinutes || 10;
      if (Array.isArray(body.files)) {
        for (const f of body.files) {
          uploadedFiles.push({
            name: f.name,
            size: f.size,
            type: f.type || "application/octet-stream",
          });
        }
      }
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one file is required." },
        { status: 400 }
      );
    }

    const now = Date.now();
    const expiresAt = now + expiryMinutes * 60 * 1000;
    const totalSize = uploadedFiles.reduce((acc, f) => acc + (f.size || 0), 0);

    const newTransfer: StoredTransfer = {
      code,
      files: uploadedFiles,
      totalSize,
      message,
      createdAt: now,
      expiresAt,
    };

    transfersMap.set(code, newTransfer);

    return NextResponse.json({
      success: true,
      code,
      expiresAt,
      expiresInSeconds: expiryMinutes * 60,
      totalSize,
      fileCount: uploadedFiles.length,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Transfer upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process file transfer." },
      { status: 500 }
    );
  }
}

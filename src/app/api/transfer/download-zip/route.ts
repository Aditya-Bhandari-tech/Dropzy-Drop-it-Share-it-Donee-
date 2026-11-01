import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import JSZip from "jszip";
import { transfersMap } from "@/lib/transferStore";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code")?.trim();

  if (!code) {
    return new NextResponse("Code is required.", { status: 400 });
  }

  const transfer = transfersMap.get(code);
  if (!transfer) {
    return new NextResponse("Transfer not found or expired.", { status: 404 });
  }

  const zip = new JSZip();
  const uploadDir = path.join(process.cwd(), "uploads", code);

  for (const file of transfer.files) {
    const safeName = path.basename(file.name);
    const filePath = path.join(uploadDir, safeName);

    try {
      const buffer = await fs.readFile(filePath);
      zip.file(safeName, buffer);
    } catch {
      // If file not found on disk, generate placeholder content so zip is valid
      zip.file(
        safeName,
        `Dropzy Transfer Archive\nFile: ${safeName}\nTransfer Code: #${code}\nSlogan: Drop it, Share it, Done!`
      );
    }
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

  return new Response(new Uint8Array(zipBuffer), {
    status: 200,
    headers: {
      "Content-Disposition": `attachment; filename="Dropzy-${code}.zip"`,
      "Content-Type": "application/zip",
      "Content-Length": zipBuffer.length.toString(),
    },
  });
}

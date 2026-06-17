import { NextRequest, NextResponse } from "next/server";

const MAX_SIZE_MB = 8;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No se recibio ningun archivo" }, { status: 400 });
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_SIZE_MB) {
      return NextResponse.json({ error: `La imagen pesa ${sizeMB.toFixed(1)}MB. El maximo permitido es ${MAX_SIZE_MB}MB. Intenta con una foto mas liviana.` }, { status: 400 });
    }

    const tiposValidos = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!tiposValidos.includes(file.type)) {
      return NextResponse.json({ error: "Formato no soportado. Use JPG, PNG o WEBP." }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const timestamp = Math.round(Date.now() / 1000);
    const crypto = await import("crypto");
    const paramsToSign = `timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

    const uploadFormData = new FormData();
    uploadFormData.append("file", dataUri);
    uploadFormData.append("api_key", apiKey!);
    uploadFormData.append("timestamp", timestamp.toString());
    uploadFormData.append("signature", signature);
    uploadFormData.append("transformation", "c_fill,w_1200,h_1200,q_auto,f_auto");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: uploadFormData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json({ error: "No pudimos procesar la imagen. Intenta de nuevo en un momento." }, { status: 500 });
    }

    const data = await res.json();

    if (!data.secure_url) {
      return NextResponse.json({ error: "No pudimos procesar la imagen. Intenta con otra foto." }, { status: 500 });
    }

    return NextResponse.json({ url: data.secure_url });
  } catch (error: any) {
    if (error.name === "AbortError") {
      return NextResponse.json({ error: "La subida tardo demasiado. Verifica tu conexion e intenta de nuevo." }, { status: 408 });
    }
    return NextResponse.json({ error: "Hubo un error al subir la imagen. Intenta de nuevo." }, { status: 500 });
  }
}
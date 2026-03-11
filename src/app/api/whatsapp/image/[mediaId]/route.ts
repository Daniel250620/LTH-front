import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ mediaId: string }> },
) {
  const { mediaId } = await params;
  let token = process.env.NEXT_PUBLIC_WHATSAPP_TOKEN;

  if (!token) {
    console.error("WHATSAPP_TOKEN is not configured");
    return NextResponse.json({ error: "Token not found" }, { status: 500 });
  }

  // Remove quotes and whitespace
  token = token
    .trim()
    .replace(/^"(.*)"$/, "$1")
    .trim();

  // Safe logging for debugging (don't log the full token)
  console.log(`[WhatsApp Proxy] Media ID: ${mediaId}`);
  console.log(`[WhatsApp Proxy] Token prefix: ${token.substring(0, 15)}...`);
  console.log(`[WhatsApp Proxy] Token length: ${token.length}`);

  try {
    const metaRes = await fetch(`https://graph.facebook.com/v18.0/${mediaId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!metaRes.ok) {
      const errorData = await metaRes.text();
      console.error("Error fetching Meta metadata:", metaRes.status, errorData);
      return NextResponse.json(
        { error: "Failed to fetch meta data from Meta" },
        { status: metaRes.status },
      );
    }

    const metaData = await metaRes.json();
    if (!metaData.url) {
      console.error("No URL in Meta response", metaData);
      return NextResponse.json(
        { error: "No URL in Meta response" },
        { status: 404 },
      );
    }

    // 2. Fetch the actual image
    const imageRes = await fetch(metaData.url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!imageRes.ok) {
      const errorData = await imageRes.text();
      console.error(
        "Error downloading image from Meta:",
        imageRes.status,
        errorData,
      );
      return NextResponse.json(
        { error: "Failed to download image from Meta" },
        { status: imageRes.status },
      );
    }

    const imageBlob = await imageRes.blob();
    const headers = new Headers();
    headers.set(
      "Content-Type",
      imageRes.headers.get("Content-Type") || "image/jpeg",
    );
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new Response(imageBlob, { headers });
  } catch (error: any) {
    console.error("Error in WhatsApp image proxy:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

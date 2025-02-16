import sharp from "sharp";

export async function getFaviconBuffer(
  faviconUrl: string
): Promise<Buffer | null> {
  try {
    const domain = new URL(faviconUrl).hostname;
    console.log("Getting favicon for domain:", domain);

    const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    console.log("Fetching favicon from:", googleFaviconUrl);

    const response = await fetch(googleFaviconUrl);
    console.log("Favicon fetch response status:", response.status);

    if (!response.ok) {
      throw new Error(`Failed to fetch favicon: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log("Favicon buffer size:", buffer.length, "bytes");

    console.log("Processing favicon with sharp...");
    const processedBuffer = await sharp(buffer)
      .resize(50, 50, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toBuffer();

    console.log(
      "Processed favicon buffer size:",
      processedBuffer.length,
      "bytes"
    );
    return processedBuffer;
  } catch (error) {
    console.error("Error in getFaviconBuffer:", error);
    return null;
  }
}

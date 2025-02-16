import QRCode from "qrcode";
import { createCanvas, loadImage } from "canvas";

export async function generateQRCode(
  shortUrl: string,
  logoBuffer?: Buffer | null
): Promise<string> {
  try {
    const qrCodeBuffer = await QRCode.toBuffer(shortUrl, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 400,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    if (logoBuffer) {
      console.log("Adding logo to QR code...");
      const canvas = createCanvas(400, 400);
      const ctx = canvas.getContext("2d");

      const qrImage = await loadImage(qrCodeBuffer);
      ctx.drawImage(qrImage, 0, 0);

      const logoImage = await loadImage(logoBuffer);
      const logoSize = canvas.width * 0.25;
      const logoX = (canvas.width - logoSize) / 2;
      const logoY = (canvas.height - logoSize) / 2;

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4);
      ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);

      return canvas.toDataURL("image/png");
    }

    return `data:image/png;base64,${qrCodeBuffer.toString("base64")}`;
  } catch (error) {
    console.error("QR code generation error:", error);
    return QRCode.toDataURL(shortUrl, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 400,
    });
  }
}

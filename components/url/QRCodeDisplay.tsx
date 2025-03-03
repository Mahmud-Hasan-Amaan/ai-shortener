"use client";
import { QrCode } from "lucide-react";
import Image from "next/image";

interface QRCodeDisplayProps {
  qrCode: string;
}

export function QRCodeDisplay({ qrCode }: QRCodeDisplayProps) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = "qrcode.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      <h3 className="text-xl font-semibold">QR Code</h3>
      <div className="bg-white p-4 rounded-lg">
        <Image
          src={qrCode}
          alt="QR Code"
          width={200}
          height={200}
          className="rounded-lg"
        />
      </div>
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
      >
        <QrCode className="w-5 h-5" />
        Download QR Code
      </button>
    </div>
  );
}

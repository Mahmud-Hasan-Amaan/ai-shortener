"use client";
import { QrCode } from "lucide-react";
import { motion } from "framer-motion";

interface QRCodeDisplayProps {
  qrCode: string;
}

export function QRCodeDisplay({ qrCode }: QRCodeDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-purple-400 font-medium flex items-center gap-2">
        <QrCode className="w-4 h-4" />
        QR Code
      </p>
      <div className="p-4 bg-white rounded-2xl shadow-lg">
        <img
          src={qrCode}
          alt="QR Code"
          className="w-[200px] h-[200px]"
        />
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          const downloadLink = document.createElement("a");
          downloadLink.href = qrCode;
          downloadLink.download = "qrcode.png";
          downloadLink.click();
        }}
        className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-white hover:from-purple-500/30 hover:to-cyan-500/30 transition-colors"
      >
        Download QR Code
      </motion.button>
    </div>
  );
}

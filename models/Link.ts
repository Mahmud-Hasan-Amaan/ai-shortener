import mongoose from "mongoose";

const LinkSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    originalUrl: { type: String, required: true },
    shortCode: { type: String, unique: true, required: true },
    aiGeneratedAlias: { type: String },
    clickCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    expirationDate: { type: Date },
    visitors: [{ type: String }],
    qrCode: {
      type: String,
      required: false,
      select: true,
    },
    metadata: {
      title: { type: String, required: true, default: "Untitled" },
      shortTitle: { type: String, required: true, default: "Untitled" },
      description: { type: String, required: true, default: "No description" },
      image: { type: String, default: "" },
      favicon: { type: String, default: "" },
      keywords: { type: [String], default: [] },
    },
    clicks: [
      {
        timestamp: { type: Date, default: Date.now },
        device: String,
        browser: String,
        os: String,
        location: String,
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    strict: false,
  }
);

LinkSchema.set("toJSON", { getters: true });
LinkSchema.set("toObject", { getters: true });

const Link = mongoose.models.Link || mongoose.model("Link", LinkSchema);
export default Link;

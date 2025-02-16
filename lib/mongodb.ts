// https://www.codewithharry.com/blogpost/%60how-to-integrate-mongodb-into-your-nextjs-apps%60/
// lib/mongodb.js

import mongoose from "mongoose";
import { registerCleanup } from "@/lib/utils/cleanup";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    const conn = await mongoose.connect(MONGODB_URI!, {
      bufferCommands: false,
    });

    registerCleanup(() => {
      conn.disconnect();
    });

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

export default dbConnect;

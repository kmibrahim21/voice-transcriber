import fs from "fs";
import path from "path";
import { IncomingForm } from "formidable";
import OpenAI from "openai";

export const config = {
  api: {
    bodyParser: false, // ❌ Body parser disable কারণ আমরা formidable ব্যবহার করবো
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = new IncomingForm({ uploadDir: "/tmp", keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parse error:", err);
        return res.status(500).json({ error: "File upload failed" });
      }

      const filePath = files.audio.filepath;

      try {
        const transcription = await openai.audio.transcriptions.create({
          file: fs.createReadStream(filePath),
          model: "whisper-1",
        });

        // টেম্প ফাইল মুছে ফেলবো

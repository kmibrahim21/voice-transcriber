import fs from "fs";
import { IncomingForm } from "formidable";
import OpenAI from "openai";

export const config = {
  api: {
    bodyParser: false, // কারণ আমরা formidable দিয়ে ফাইল নেব
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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

      fs.unlinkSync(filePath); // টেম্প ফাইল মুছে ফেলো

      return res.status(200).json({ text: transcription.text });
    } catch (error) {
      console.error("Transcription error:", error);
      return res.status(500).json({ error: "Transcription failed" });
    }
  });
}

import fs from "fs";
import path from "path";
import multer from "multer";
import OpenAI from "openai";

export const config = {
  api: {
    bodyParser: false, // Multer handle করবে
  },
};

const upload = multer({ dest: "/tmp" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default function handler(req, res) {
  if (req.method === "POST") {
    upload.single("audio")(req, {}, async (err) => {
      if (err) return res.status(500).json({ error: "Upload failed" });

      try {
        const audioPath = req.file.path;

        const transcription = await openai.audio.transcriptions.create({
          file: fs.createReadStream(audioPath),
          model: "whisper-1",
        });

        fs.unlinkSync(audioPath); // টেম্প ফাইল ডিলিট

        res.status(200).json({ text: transcription.text });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Transcription failed" });
      }
    });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

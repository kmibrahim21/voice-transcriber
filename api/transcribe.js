import express from "express";
import multer from "multer";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import OpenAI from "openai";

// Express setup
const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.json());

// OpenAI init (API Key from env)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Upload endpoint
app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    const audioPath = req.file.path;

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-1",
    });

    // Cleanup temp file
    fs.unlinkSync(audioPath);

    res.json({ text: transcription.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Transcription failed" });
  }
});

// Root test
app.get("/", (req, res) => {
  res.send("✅ Voice Transcriber API running!");
});

// Listen (local test only)
if (process.env.NODE_ENV !== "production") {
  app.listen(3000, () => console.log("Server running on port 3000"));
}

export default app;

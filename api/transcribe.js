import fs from "fs";
import path from "path";
import { promisify } from "util";
import OpenAI from "openai";

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data = await req.body;
    if (!data) return res.status(400).json({ error: "No audio data" });

    // Convert base64 to file
    const buffer = Buffer.from(data.audio.split(",")[1], "base64");
    const filePath = path.join("/tmp", `recording-${Date.now()}.webm`);
    await writeFile(filePath, buffer);

    // OpenAI call
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
    });

    // Cleanup
    await unlink(filePath);

    return res.status(200).json({ text: transcription.text });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Transcription failed" });
  }
}

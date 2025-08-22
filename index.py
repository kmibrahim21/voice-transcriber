import os
import openai
from flask import Flask, request, jsonify

app = Flask(__name__)

# ✅ Environment variable থেকে key নেওয়া
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    audio_file = request.files["file"]

    try:
        transcript = openai.audio.transcriptions.create(
            model="gpt-4o-transcribe",
            file=audio_file
        )
        return jsonify({"text": transcript.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

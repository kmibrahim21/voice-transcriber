from flask import Flask, request, jsonify
import os
import openai

app = Flask(__name__)
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    audio_file = request.files["file"]

    transcript = openai.audio.transcriptions.create(
        model="gpt-4o-transcribe",
        file=audio_file
    )

    return jsonify({"text": transcript.text})

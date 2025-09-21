import os
import tempfile
from flask import Flask, request, jsonify, render_template_string
from dotenv import load_dotenv
from ocr_llama import IntelligentInvoiceProcessor

# Load API key dari .env
load_dotenv()
api_key = os.getenv("LLM_API_KEY")

# Inisialisasi Flask & Processor
app = Flask(__name__)
processor = IntelligentInvoiceProcessor(groq_api_key=api_key)

@app.route("/")
def home():
    # HTML form sederhana untuk testing upload
    return render_template_string("""
    <h2>Upload Invoice</h2>
    <form action="/process_invoice" method="post" enctype="multipart/form-data">
        <input type="file" name="file">
        <input type="submit" value="Upload">
    </form>
    """)

@app.route("/process_invoice", methods=["POST"])
def process_invoice():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    uploaded_file = request.files["file"]

    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        uploaded_file.save(tmp.name)
        temp_path = tmp.name

    try:
        # Jalankan pipeline OCR + LLM dari transformer.py
        result = processor.process_invoice(temp_path)

        return jsonify(result)

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
import os
import tempfile
from flask import Flask, request, jsonify, render_template_string
from dotenv import load_dotenv
# from ocr_llama import IntelligentInvoiceProcessor
from handwritingocr import HandwritingOCR

load_dotenv()
api_key = os.getenv("LLM_API_KEY")

app = Flask(__name__)
# processor_free = IntelligentInvoiceProcessor(groq_api_key=api_key)
processor_pro = HandwritingOCR(groq_api_key=api_key)

@app.route("/")
def home():
    # HTML form sederhana untuk testing upload manual dengan pilihan user_type
    return render_template_string("""
    <h2>Upload Invoice (Simulasi)</h2>
    <form action="/process_invoice" method="post" enctype="multipart/form-data">
        <label>Pilih tipe user:</label><br>
        <select name="user_type">
            <option value="free">Free (EasyOCR)</option>
            <option value="pro">Pro (Handwriting OCR)</option>
        </select><br><br>

        <label>Upload file:</label><br>
        <input type="file" name="file" required><br><br>

        <input type="submit" value="Upload dan Proses">
    </form>
    """)

@app.route("/process_invoice", methods=["POST"])
def process_invoice():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    uploaded_file = request.files["file"]
    user_type = request.form.get("user_type", "free")  # default ke "free"

    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        uploaded_file.save(tmp.name)
        temp_path = tmp.name

    try:
        # Pilih processor berdasarkan tipe user
        if user_type == "pro":
            result = processor_pro.process_invoice(temp_path)
        else:
            result = processor_pro.process_invoice(temp_path)

        return jsonify({
            "status": "success",
            "user_type": user_type,
            "data": result
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=False)

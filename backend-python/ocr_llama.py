import os
import json
import re
import tempfile
from flask import Flask, request, jsonify, render_template_string
import easyocr
from dotenv import load_dotenv
from langchain.prompts import PromptTemplate
from langchain_groq import ChatGroq

# Import fungsi pendukung dari kode kamu (bisa juga langsung copy di sini)
# ---------------------------------------------------------
load_dotenv()
api_key = os.getenv("LLM_API_KEY")

app = Flask(__name__)

def create_invoice_processor():
    llm = ChatGroq(
        groq_api_key=api_key,
        model="llama-3.1-8b-instant",
        temperature=0
    )
    prompt = PromptTemplate(
        input_variables=["ocr_text"],
        template="""You are an expert at extracting structured data from Indonesian invoices. 

Given this OCR text from an Indonesian invoice:
{ocr_text}

Extract the information and return ONLY a valid JSON object with these fields:
- company_name
- customer_name
- invoice_date
- invoice_number
- total_amount
- currency
- items (array of name + price)
- email

IMPORTANT: Return ONLY valid JSON, no explanation.

JSON:"""
    )
    return llm, prompt

def clean_json_response(response_text):
    response_text = re.sub(r'```json\s*', '', response_text)
    response_text = re.sub(r'```\s*', '', response_text)

    json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
    if json_match:
        json_str = json_match.group(0).strip()
        try:
            return json.loads(json_str)
        except:
            json_str = re.sub(r',\s*}', '}', json_str)
            json_str = re.sub(r',\s*]', ']', json_str)
            try:
                return json.loads(json_str)
            except:
                return {"error": "Could not parse JSON", "raw_response": response_text}
    return {"error": "No JSON found", "raw_response": response_text}

def process_invoice_text(ocr_text_list):
    llm, prompt = create_invoice_processor()
    formatted_text = " | ".join(ocr_text_list)
    formatted_prompt = prompt.format(ocr_text=formatted_text)
    response = llm.invoke(formatted_prompt)
    response_text = response.content if hasattr(response, "content") else str(response)
    result = clean_json_response(response_text)
    return result
# ---------------------------------------------------------

@app.route("/")
def home():
    # Simple HTML form
    return render_template_string("""
    <h2>Upload Invoice</h2>
    <form action="/process_invoice" method="post" enctype="multipart/form-data">
        <input type="file" name="file">
        <input type="submit" value="Upload">
    </form>
    """)


# ✅ Endpoint untuk proses invoice
@app.route('/process_invoice', methods=['GET', 'POST'])
def process_invoice():
    if request.method == 'GET':
        return {"message": "Upload your invoice via POST request"}
    # kalau POST, lanjut proses file

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    # Simpan ke file sementara
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        file.save(tmp.name)
        file_path = tmp.name

    try:
        # OCR
        reader = easyocr.Reader(['id', 'en'], gpu=False)
        result = reader.readtext(file_path)
        text_only = [text for (bbox, text, conf) in result]

        # Proses dengan LLM
        invoice_data = process_invoice_text(text_only)

        return jsonify({
            "status": "success",
            "data": invoice_data
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
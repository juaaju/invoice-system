import os
import sys
import time
import requests
from dotenv import load_dotenv
from groq import Groq
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
import json
load_dotenv()

class HandwritingOCR:
    def __init__(self, groq_api_key=None):
        self.api_key = os.getenv("OCR_SPACE_API_KEY")  # pakai key OCR.Space
        if not self.api_key:
            raise ValueError("❌ OCR_SPACE_API_KEY tidak ditemukan di .env")

        self.llm = ChatGroq(
            groq_api_key=groq_api_key,
            model="llama-3.1-8b-instant",
            temperature=0.1
        )

    def upload_and_ocr(self, file_path):
        """Langsung upload ke OCR.Space dan ambil hasil teks"""
        url = "https://api.ocr.space/parse/image"
        payload = {
            "apikey": self.api_key,
            "language": "eng",  # bisa juga 'eng+ind' kalau banyak teks Indonesia
            "OCREngine": 2,
            "scale": True,
            "isOverlayRequired": False
        }
        files = {"file": open(file_path, "rb")}

        print("📤 Mengunggah dan memproses dokumen ke OCR.Space...")
        response = requests.post(url, files=files, data=payload)
        files["file"].close()

        if response.status_code != 200:
            raise RuntimeError(f"❌ OCR.Space error: {response.status_code} - {response.text}")

        result = response.json()

        if result.get("IsErroredOnProcessing"):
            raise RuntimeError(f"❌ OCR gagal: {result.get('ErrorMessage', 'Unknown error')}")

        text = result["ParsedResults"][0]["ParsedText"]
        print("✅ OCR selesai.")
        return text.strip()

    def analyze_with_llm(self, text):
        """Analisis hasil OCR pakai LLM Groq"""
        template = PromptTemplate(
            input_variables=["invoice_text"],
            template="""
You are an expert invoice data extractor. Given the following OCR text from an invoice, extract structured fields.

Return ONLY valid JSON with this exact schema:

{{
"company_name": "string or empty if not found",
"customer_name": "string or empty if not found",
"invoice_date": "DD-MM-YYYY or empty if not found",
"invoice_number": "string or empty if not found",
"items": [
    {{
    "name": "item name",
    "quantity": number,
    "unit_price": string ("use dot as price separator, for example 12000000 → 1.2000.000"),
    "total_price": string ("use dot as price separator, for example 12000000 → 1.2000.000")
    }}
],
"total_amount": string ("use dot as total price separator, for example 12000000 → 1.2000.000"),
"currency": "Rp"
}}

Return ONLY JSON. Do not include any explanation or text outside JSON.

Invoice text:
{invoice_text}
"""
        )

        prompt = template.format(invoice_text=text)
        response = self.llm.invoke(prompt)
        return response.content.strip()

    def process_invoice(self, image_path):
        """Full pipeline: Upload → OCR → LLM"""
        ocr_text = self.upload_and_ocr(image_path)
        print("📄 OCR selesai, mengirim ke LLM...")
        json_result = self.analyze_with_llm(ocr_text)
    # 🧹 Bersihkan hasil agar langsung berupa dict JSON
        try:
            parsed = json.loads(json_result)
        except json.JSONDecodeError:
            print("⚠️ Hasil LLM bukan JSON valid, dikembalikan mentah.")
            parsed = {"raw_text": json_result}

        return parsed


# =====================================================
# CLI Mode (jalankan langsung: python ocrspace_llm.py <file>)
# =====================================================
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("⚠️  Usage: python ocrspace_llm.py <path_to_image_or_pdf>")
        sys.exit(1)

    file_path = sys.argv[1]

    if not os.path.exists(file_path):
        print(f"❌ File '{file_path}' tidak ditemukan.")
        sys.exit(1)

    groq_api_key = os.getenv("LLM_API_KEY")
    processor = HandwritingOCR(groq_api_key=groq_api_key)

    try:
        result_json = processor.process_invoice(file_path)
        print("\n📦 Hasil akhir JSON:\n")
        print(result_json)
    except Exception as e:
        print(f"❌ Error: {e}")

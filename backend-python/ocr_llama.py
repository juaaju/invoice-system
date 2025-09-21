import easyocr
import json
from dotenv import load_dotenv
import os

import numpy as np
from groq import Groq
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate

load_dotenv()
api_key = os.getenv("LLM_API_KEY")

class IntelligentInvoiceProcessor:
    def __init__(self, groq_api_key):
        self.reader = easyocr.Reader(['id', 'en'], gpu=False)
        self.llm = ChatGroq(
            groq_api_key=groq_api_key,
            model="llama-3.1-8b-instant",
            temperature=0.1  # Lower temperature for more consistent parsing
        )
        
    def extract_text_with_positions(self, image_path):
        """Extract text with bounding box coordinates"""
    
        result = self.reader.readtext(image_path)
        
        structured_data = []
        for (bbox, text, confidence) in result:
            # Calculate center point and dimensions
            x_coords = [point[0] for point in bbox]
            y_coords = [point[1] for point in bbox]
            
            center_x = sum(x_coords) / len(x_coords)
            center_y = sum(y_coords) / len(y_coords)
            width = max(x_coords) - min(x_coords)
            height = max(y_coords) - min(y_coords)
            
            structured_data.append({
                'text': text,
                'bbox': [[int(x) for x in point] for point in bbox],
                'center': [center_x, center_y],
                'dimensions': [width, height],
                'confidence': confidence
            })
        
        return structured_data
    
    def analyze_table_structure(self, structured_data):
        """Analyze spatial relationships to understand table structure"""
        # Sort by Y coordinate to get rows, then by X to get columns
        sorted_by_y = sorted(structured_data, key=lambda x: x['center'][1])
        
        # Group into rows based on Y proximity
        rows = []
        current_row = [sorted_by_y[0]] if sorted_by_y else []
        y_threshold = 15  # Adjust based on your invoice format
        
        for item in sorted_by_y[1:]:
            if abs(item['center'][1] - current_row[-1]['center'][1]) <= y_threshold:
                current_row.append(item)
            else:
                if current_row:
                    rows.append(sorted(current_row, key=lambda x: x['center'][0]))
                current_row = [item]
        
        if current_row:
            rows.append(sorted(current_row, key=lambda x: x['center'][0]))
        
        return rows
    
    def create_enhanced_prompt(self, structured_data, table_rows): 
        """Create enhanced prompt with spatial information for diverse invoices"""
        
        import json

        # Buat representasi spatial hasil OCR
        spatial_text = "SPATIAL LAYOUT ANALYSIS:\n"
        spatial_text += "="*50 + "\n"
        
        for i, row in enumerate(table_rows):
            spatial_text += f"Row {i+1}: "
            for item in row:
                spatial_text += f"[{item['text']} (conf={item['confidence']:.2f})] "
            spatial_text += "\n"
        
        # Gabungkan semua teks OCR mentah
        ocr_text = [item['text'] for item in structured_data]
        
        prompt = f"""You are an expert at extracting structured data from various types of Indonesian invoices and receipts 
    (services, retail shops, groceries, fashion, electronics, etc) using spatial layout analysis.

    ORIGINAL OCR TEXT:
    {json.dumps(ocr_text, ensure_ascii=False)}

    {spatial_text}

    INSTRUCTIONS:
    1. Analyze the invoice layout to find these possible fields (only if present):
    - Company/store/seller name (usually top header)
    - Customer/buyer name (often after "Kepada" or "Yth")
    - Invoice date (look for "Tanggal", "Date", or similar)
    - Invoice number (look for "No", "No Invoice", etc)
    2. Detect the main table of purchased items/services. Common column names may include:
    - NAMA BARANG / KETERANGAN / ITEM
    - JUMLAH / QTY / JML / Jumlah Barang
    - HARGA / UNIT PRICE / Harga Satuan
    - TOTAL / SUBTOTAL / JUMLAH HARGA / TOTAL Harga
    3. Correct common OCR issues:
    - Misread numbers: "250-0" → "250.000", "1O0,OOO" → "100.000"
    - Dashes or 'O' used instead of zeros
    - Join words split by OCR (e.g. "Min yak" → "Minyak")
    4. If unit price is missing but total and quantity exist, calculate it.
    5. Make sure all numeric fields are in numbers (not strings), without thousand separators or currency symbols.
    6. Return result as valid JSON with these fields:

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

    Return ONLY valid JSON. Do not add explanation or commentary."""

        return prompt

    
    def process_invoice(self, image_path):
        """Main processing function"""
        try:
            # Step 1: Extract text with positions
            print("Step 1: Extracting text with positions...")
            structured_data = self.extract_text_with_positions(image_path)
            
            # Step 2: Analyze table structure
            print("Step 2: Analyzing table structure...")
            table_rows = self.analyze_table_structure(structured_data)
            
            # Step 3: Create enhanced prompt
            print("Step 3: Creating enhanced prompt...")
            prompt_text = self.create_enhanced_prompt(structured_data, table_rows)
            
            # Step 4: Process with LLaMA
            print("Step 4: Processing with LLaMA...")
            response = self.llm.invoke(prompt_text)
            
            # Step 5: Parse JSON response
            try:
                # Clean the response by removing Markdown code block markers
                cleaned_response = response.content.strip()
                if cleaned_response.startswith("```"):
                    # Remove the first line and last line containing ```
                    cleaned_response = "\n".join(cleaned_response.split("\n")[1:-1])
                
                result_json = json.loads(cleaned_response)
                return {
                    "status": "success",
                    "data": result_json,
                }
            except json.JSONDecodeError as e:
                return {
                    "status": "error",
                    "error": f"Failed to parse JSON: {str(e)}",
                    "raw_response": response.content
                }
                
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }

# Usage example
def main():
    # Initialize processor
    processor = IntelligentInvoiceProcessor(api_key)
    
    # Process invoice
    result = processor.process_invoice('invoice.jpg')
    
    # Print results
    print("FINAL RESULT:")
    print("="*50)
    print(json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
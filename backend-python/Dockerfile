# backend-python/Dockerfile
FROM python:3.10-slim

# bikin working directory di container
WORKDIR /app

# copy daftar dependencies dulu
COPY requirements.txt .

# install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# copy semua source code dari folder backend-python ke /app
COPY . .

# buka port Flask/FastAPI (misalnya 8000)
EXPOSE 8000

# jalankan file utama
CMD ["python", "ocr_llama.py"]

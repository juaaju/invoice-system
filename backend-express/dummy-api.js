const express = require('express');
const app = express();

app.use(express.json());

// Dummy OCR API
app.post("/ocr", (req, res) => {
  try {
    const { imagePath } = req.body;
    res.json({
      success: true,
      imagePath,
      extractedText: "Ini hasil OCR dummy dari gambar 📷"
    });
  } catch (err) {
    console.error("❌ OCR Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Dummy LLM API
app.post("/llm", (req, res) => {
  try {
    const { text } = req.body;

    // Mapping hasil OCR ke format SPS
    const llmData = {
      barang: text,   // ambil teks OCR sebagai nama barang
      harga: 50000,   // dummy harga
      jumlah: 2       // dummy jumlah
    };

    res.json({
      success: true,
      reply: llmData
    });
  } catch (err) {
    console.error("❌ LLM Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Dummy Save Result API
app.post("/save-result", (req, res) => {
  try {
    console.log("📡 Data masuk ke dummy save-result:", req.body);
    res.json({ success: true, message: "Data berhasil disimpan (dummy)" });
  } catch (err) {
    console.error("❌ Save Result Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Jalankan server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Dummy API running at http://localhost:${PORT}`);
});

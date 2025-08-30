const express = require('express');
const app = express();
app.use(express.json());

// Dummy OCR API
app.post("/ocr", (req, res) => {
  const { imagePath } = req.body;
  res.json({
    success: true,
    imagePath,
    extractedText: "Ini hasil OCR dummy dari gambar 📷"
  });
});

// Dummy LLM API
app.post("/llm", (req, res) => {
  const { text } = req.body;
  res.json({
    success: true,
    reply: `🤖 LLM dummy menjawab berdasarkan teks: "${text}"`
  });
});

// Dummy Save Result API
app.post("/save-result", (req, res) => {
  console.log("📡 Data masuk ke dummy save-result:", req.body);
  res.json({ success: true, message: "Data berhasil disimpan (dummy)" });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Dummy API running at http://localhost:${PORT}`);
});

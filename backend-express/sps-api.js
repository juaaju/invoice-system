const { PrismaClient } = require("@prisma/client");
const { google } = require("googleapis");
const express = require("express");

const cors = require("cors");
const app = express();

app.use(cors({
  origin: "http://localhost:3000",  // asal Next.js
  credentials: true
}));

app.use(express.json());

const prisma = new PrismaClient();

async function getGoogleClient(userId) {
  // Ambil account Google user dari DB
  const account = await prisma.account.findFirst({
    where: { userId: userId, provider: "google" },
  });

  if (!account) throw new Error("Google account not found");

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL + "/api/auth/callback/google"
  );

    oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token || undefined,  // jangan kasih null
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
    });

  // auto refresh kalau expired
  oauth2Client.on("tokens", async (tokens) => {
    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? account.refresh_token,
        expires_at: Math.floor(tokens.expiry_date / 1000),
      },
    });
  });

  return oauth2Client;
}

app.post("/sheets/create/:userId", async (req, res) => {
  try {
    const client = await getGoogleClient(req.params.userId);
    const sheets = google.sheets({ version: "v4", auth: client });

    const sheetName = req.body.name || "Spreadsheet Baru Dari API";

    const response = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title: sheetName },
        sheets: [{ properties: { title: "Sheet1" } }],
      },
    });

    const spreadsheetId = response.data.spreadsheetId;

    await prisma.spreadsheetList.create({
      data: {
        userId: req.params.userId,
        name: sheetName,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
      },
    });

    res.json({
      message: "Spreadsheet baru berhasil dibuat!",
      spreadsheetId,
      url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Gagal bikin spreadsheet baru");
  }
});

app.put("/sheets/update/:userId/:id", async (req, res) => {
  try {
    const { userId, id } = req.params;
    const { name } = req.body;

    // cari spreadsheet di DB
    const spreadsheet = await prisma.spreadsheetList.findUnique({
      where: { id: String(id) },
    });

    if (!spreadsheet) {
      return res.status(404).json({ error: "Spreadsheet tidak ditemukan di DB" });
    }

    // Ambil sheetId Google dari URL
    const match = spreadsheet.spreadsheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      return res.status(400).json({ error: "Spreadsheet ID Google tidak valid" });
    }
    const sheetId = match[1];

    // update di Google Sheets
    const client = await getGoogleClient(userId);
    const sheets = google.sheets({ version: "v4", auth: client });

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [
          {
            updateSpreadsheetProperties: {
              properties: { title: name },
              fields: "title",
            },
          },
        ],
      },
    });

    // update juga di DB
    const updated = await prisma.spreadsheetList.update({
      where: { id: String(id) }, 
      data: { name },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).send("Gagal update spreadsheet");
  }
});

// Hapus spreadsheet di DB + Google Drive
app.delete("/sheets/:userId/:id", async (req, res) => {
  try {
    const { userId, id } = req.params;

    // cari data spreadsheet di DB
    const spreadsheet = await prisma.spreadsheetList.findUnique({
      where: { id: String(id) }, // ✅ jangan parseInt
    });

    if (!spreadsheet) {
      return res.status(404).json({ error: "Spreadsheet tidak ditemukan" });
    }

    // Ambil spreadsheetId dari URL
    const match = spreadsheet.spreadsheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      return res.status(400).json({ error: "Spreadsheet ID tidak valid" });
    }
    const spreadsheetId = match[1];

    // Auth Google client
    const client = await getGoogleClient(userId);
    const drive = google.drive({ version: "v3", auth: client });

    // Hapus dari Google Drive
    await drive.files.delete({ fileId: spreadsheetId });

    // Hapus record dari DB
    await prisma.spreadsheetList.delete({
      where: { id: String(id) }, // ✅ jangan parseInt
    });

    res.json({ message: "Spreadsheet berhasil dihapus dari Google Drive dan DB" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal hapus spreadsheet" });
  }
});

app.post("/sheets/append/:userId/:id", async (req, res) => {
  try {
    const { userId, id } = req.params;
    const { data } = req.body; 
    // data = { barang: "Beras", harga: 50000, jumlah: 2 }

    if (!data || !data.barang || !data.harga || !data.jumlah) {
      return res.status(400).json({ error: "Data tidak lengkap" });
    }

    // Ambil spreadsheet dari DB
    const spreadsheet = await prisma.spreadsheetList.findUnique({
      where: { id: String(id) },
    });

    if (!spreadsheet) return res.status(404).json({ error: "Spreadsheet tidak ditemukan" });

    // Ambil ID Google Sheets dari URL
    const match = spreadsheet.spreadsheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) return res.status(400).json({ error: "Spreadsheet ID Google tidak valid" });

    const sheetId = match[1];

    // Auth Google client
    const client = await getGoogleClient(userId);
    const sheets = google.sheets({ version: "v4", auth: client });

    // Cek apakah header sudah ada di Sheet1!A1:C1
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Sheet1!A1:C1",
    });

    if (!result.data.values || result.data.values.length === 0) {
      // tulis header jika kosong
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: "Sheet1!A1:C1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [["Barang", "Harga", "Jumlah"]],
        },
      });
    }

    // Masukkan data ke Sheet1
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Sheet1!A:C",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[data.barang, data.harga, data.jumlah]],
      },
    });

    return res.json({ message: "Data berhasil ditambahkan ke spreadsheet" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Gagal menambahkan data ke spreadsheet" });
  }
});

module.exports = app;
// jalankan server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
})
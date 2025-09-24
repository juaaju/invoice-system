const { PrismaClient } = require("@prisma/client");
const { google } = require("googleapis");
const express = require("express");

const cors = require("cors");
const app = express();

app.use(cors({ origin: "*"}));

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
    console.log("📩 Request diterima di /sheets/create:", req.params.userId);

    const client = await getGoogleClient(req.params.userId);
    console.log("✅ Client Google siap");

    const sheets = google.sheets({ version: "v4", auth: client });

    const sheetName = req.body.name || "Spreadsheet Baru Dari API";
    console.log("📄 Nama sheet:", sheetName);

    const response = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title: sheetName },
        sheets: [{ properties: { title: "Sheet1" } }],
      },
    });
    console.log("📊 Google API sukses");

    const spreadsheetId = response.data.spreadsheetId;

    await prisma.spreadsheetList.create({
      data: {
        userId: req.params.userId,
        name: sheetName,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
      },
    });
    console.log("💾 Data masuk database");

    console.log("➡️ Returning response:", spreadsheetId);
    res.json({
      message: "Spreadsheet baru berhasil dibuat!",
      spreadsheetId,
      url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    });
  } catch (err) {
    console.error("❌ Error di backend:", err);
    res.status(500).json({ error: "Gagal bikin spreadsheet baru" });
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

    // 1. Cek spreadsheet di DB
    const spreadsheet = await prisma.spreadsheetList.findUnique({
      where: { id: String(id) },
    });
    if (!spreadsheet) {
      return res.status(404).json({ error: "Spreadsheet tidak ditemukan" });
    }

    // 2. Ambil ID Google dari URL
    const match = spreadsheet.spreadsheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      return res.status(400).json({ error: "Spreadsheet ID tidak valid" });
    }
    const spreadsheetId = match[1];

    // 3. Auth Google client
    const client = await getGoogleClient(userId);
    const drive = google.drive({ version: "v3", auth: client });

    // 4. Hapus di Google Drive (handle kalau 404)
    try {
      await drive.files.delete({ fileId: spreadsheetId });
    } catch (err) {
      if (err.code === 404) {
        console.warn(`⚠️ File ${spreadsheetId} not found in Google Drive, skipping delete...`);
      } else {
        throw err;
      }
    }

    // 5. Hapus semua koneksi terkait dulu
    await prisma.spreadsheetConnection.deleteMany({
      where: { spreadsheetId: String(id) },
    });

    // 6. Baru hapus SpreadsheetList
    await prisma.spreadsheetList.delete({
      where: { id: String(id) },
    });


    res.json({ message: "Spreadsheet berhasil dihapus dari DB (Drive skip jika tidak ditemukan)" });
  } catch (err) {
    console.error("DELETE ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "Gagal hapus spreadsheet", detail: err.message });
  }
});

// Terima data invoice dari bot-api.js
app.post("/sheets/append/:userId/:id", async (req, res) => {
  try {
    const { userId, id } = req.params;
    const invoice = req.body.data; // JSON dari Flask

    if (!invoice || !invoice.items || invoice.items.length === 0) {
      return res.status(400).json({ error: "Invoice tidak valid" });
    }

    // Ambil spreadsheet dari DB
    const spreadsheet = await prisma.spreadsheetList.findUnique({
      where: { id: String(id) },
    });
    if (!spreadsheet) return res.status(404).json({ error: "Spreadsheet tidak ditemukan" });

    const match = spreadsheet.spreadsheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) return res.status(400).json({ error: "Spreadsheet ID Google tidak valid" });

    const sheetId = match[1];
    const client = await getGoogleClient(userId);
    const sheets = google.sheets({ version: "v4", auth: client });

    // Pastikan ada header sesuai JSON
    const headerRange = "Sheet1!A1:H1";
    const headerResult = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: headerRange,
    });

    if (!headerResult.data.values || headerResult.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: headerRange,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [["Invoice Number", "Date", "Vendor", "Total Price", "Item", "Price", "Qty", "Total Amount"]],
        },
      });
    }

    // Flatten items → setiap item jadi 1 baris dengan metadata invoice
    const values = invoice.items.map(item => [
      invoice.invoice_number,
      invoice.invoice_date,
      invoice.company_name,
      item.total_price,
      item.name,
      item.unit_price,
      item.quantity || 1,
      invoice.total_amount,
    ]);


    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Sheet1!A:H",
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });

    return res.json({ message: "Invoice berhasil ditambahkan ke spreadsheet" });
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
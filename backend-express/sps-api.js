const { PrismaClient } = require("@prisma/client");
const { google } = require("googleapis");
const express = require("express");

const cors = require("cors");
const app = express();

app.use(cors()); // izinkan semua origin
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
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at * 1000,
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

module.exports = app;
// jalankan server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
})
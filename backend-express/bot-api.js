const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')
const fs = require('fs')
const fsPromises = fs.promises
const axios = require('axios')
const tmp = require('tmp')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')

  const sock = makeWASocket({
    auth: state,
    browser: ["Ubuntu", "Chrome", "22.04.4"],
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log("Scan QR ini pakai WhatsApp HP kamu:")
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') console.log("✅ Bot sudah terhubung ke WhatsApp")

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      console.log("❌ Koneksi terputus", lastDisconnect?.error)
      if (shouldReconnect) startBot()
      else console.log("🚪 Logout, hapus folder auth_info lalu jalankan ulang untuk scan QR")
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const fullJid = msg.key.remoteJid; // untuk sendMessage
    if (!fullJid) return; 
    const fromNumber = fullJid.split('@')[0]; // untuk mapping DB

    // ✅ mapping nomor WA ke userId
    const waAccount = await prisma.whatsAppAccount.findUnique({
      where: { phoneNumber: fromNumber }
    });
    if (!waAccount || !waAccount.userId) {
      await sock.sendMessage(fullJid, { text: "⚠️ Nomor kamu belum terhubung ke akun user." });
      return;
    }
    const userId = waAccount.userId

    // Ambil spreadsheet user terbaru
    const sheet = await prisma.spreadsheetList.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    if (!sheet) {
      await sock.sendMessage(fullJid, { text: "⚠️ Kamu belum punya spreadsheet." })
      return
    }

    const sheetId = sheet.id

    // --- Proses teks ---
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text
    if (text) {
      console.log(`📩 Teks dari ${fromNumber}: ${text}`)
      await sock.sendMessage(fullJid, { text: `Halo 👋, kamu barusan kirim: "${text}"` })
    }

    // --- Proses gambar ---
    // --- Bagian proses gambar ---
    const imageMsg = msg.message.imageMessage;
    if (imageMsg) {
      console.log(`📷 Gambar diterima dari ${fromNumber}`);
      let tempFile;
      try {
        // Download media
        const buffer = await downloadMediaMessage(msg, "buffer", {}, { logger: console });
        tempFile = tmp.fileSync({ postfix: ".jpg" });
        await fsPromises.writeFile(tempFile.name, buffer);
        console.log(`✅ Gambar disimpan sementara di ${tempFile.name}`);

        // Kirim ke Flask endpoint
        const FormData = require("form-data");
        const form = new FormData();
        form.append("file", fs.createReadStream(tempFile.name));

        let flaskRes;
        try {
          flaskRes = await axios.post("http://localhost:8000/process_invoice", form, {
            headers: form.getHeaders(),
            timeout: 120000 // timeout 30 detik
          });
        } catch (flaskErr) {
          console.error("❌ Error saat request ke Flask:", flaskErr.response?.data || flaskErr.message);
          await sock.sendMessage(fullJid, { 
            text: `⚠️ Gagal memproses invoice di Flask:\n${JSON.stringify(flaskErr.response?.data || flaskErr.message, null, 2)}` 
          });
          return; // hentikan proses selanjutnya
        }

        const invoiceData = flaskRes.data.data;
        console.log("📄 Hasil dari Flask:", invoiceData);

        // Kirim ke SPS
        try {
          await axios.post(`http://localhost:5000/sheets/append/${userId}/${sheetId}`, {data: invoiceData});

          console.log("📡 Hasil dikirim ke API SPS");

          await sock.sendMessage(fullJid, { 
            text: `✅ Data invoice berhasil diproses dan dikirim ke spreadsheet:\n${JSON.stringify(invoiceData, null, 2)}` 
          });
        } catch (spsErr) {
          console.error("❌ Error saat kirim ke SPS:", spsErr.response?.data || spsErr.message);
          await sock.sendMessage(fullJid, { 
            text: `⚠️ Gagal mengirim data ke spreadsheet:\n${JSON.stringify(spsErr.response?.data || spsErr.message, null, 2)}` 
          });
        }

      } catch (err) {
        console.error("❌ Error umum saat proses gambar:", err.stack || err.message);
        await sock.sendMessage(fullJid, { 
          text: `⚠️ Terjadi kesalahan saat memproses gambar:\n${err.stack || err.message}` 
        });
      } finally {
        if (tempFile) {
          tempFile.removeCallback();
          console.log(`🗑️ File sementara dibersihkan`);
        }
      }
    }


  })

}

startBot()
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage } = require('@whiskeysockets/baileys')
const express = require('express')
const cors = require('cors')
const QRCode = require('qrcode')
const fs = require('fs')
const fsPromises = fs.promises
const axios = require('axios')
const tmp = require('tmp')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Express setup
const app = express()
app.use(cors())
app.use(express.json())

let currentQR = null
let isConnected = false

// Endpoint untuk QR viewer
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>WhatsApp Bot - QR Code</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 20px;
          padding: 40px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          text-align: center;
        }
        h1 { color: #333; margin-bottom: 10px; font-size: 28px; }
        .subtitle { color: #666; margin-bottom: 30px; font-size: 14px; }
        .qr-container {
          background: #f5f5f5;
          border-radius: 15px;
          padding: 30px;
          margin-bottom: 25px;
          min-height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        #qrCode { max-width: 100%; height: auto; display: none; }
        .loading { display: flex; flex-direction: column; align-items: center; gap: 15px; }
        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid #e0e0e0;
          border-top: 5px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .status { color: #666; font-size: 14px; }
        .instructions {
          background: #f0f4ff;
          border-left: 4px solid #667eea;
          padding: 20px;
          border-radius: 8px;
          text-align: left;
        }
        .instructions h3 { color: #667eea; font-size: 16px; margin-bottom: 12px; }
        .instructions ol { margin-left: 20px; color: #555; line-height: 1.8; }
        .connected { background: #d4edda; border-left-color: #28a745; }
        .connected h3 { color: #28a745; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🤖 WhatsApp Bot</h1>
        <p class="subtitle">Scan QR Code untuk menghubungkan bot</p>
        <div class="qr-container">
          <img id="qrCode" alt="QR Code">
          <div class="loading" id="loading">
            <div class="spinner"></div>
            <p class="status">Menunggu QR Code...</p>
          </div>
        </div>
        <div class="instructions" id="instructions">
          <h3>📱 Cara Scan QR Code:</h3>
          <ol>
            <li>Buka WhatsApp di HP kamu</li>
            <li>Tap Menu (⋮) atau Settings</li>
            <li>Pilih "Linked Devices"</li>
            <li>Tap "Link a Device"</li>
            <li>Scan QR code di atas</li>
          </ol>
        </div>
      </div>
      <script>
        async function fetchQR() {
          try {
            const res = await fetch('/qr-status');
            const data = await res.json();
            if (data.qr) {
              document.getElementById('qrCode').src = data.qr;
              document.getElementById('qrCode').style.display = 'block';
              document.getElementById('loading').style.display = 'none';
            } else if (data.status === 'connected') {
              document.getElementById('qrCode').style.display = 'none';
              document.getElementById('loading').innerHTML = \`
                <div style="color: #28a745; font-size: 48px;">✅</div>
                <p class="status" style="color: #28a745; font-weight: bold;">Bot Terhubung!</p>
              \`;
              document.getElementById('instructions').className = 'instructions connected';
              document.getElementById('instructions').innerHTML = \`
                <h3>✅ Berhasil Terhubung</h3>
                <p>Bot WhatsApp sudah siap menerima pesan.</p>
              \`;
            }
          } catch (err) {
            console.error('Error:', err);
          }
        }
        setInterval(fetchQR, 2000);
        fetchQR();
      </script>
    </body>
    </html>
  `)
})

app.get('/qr-status', (req, res) => {
  if (isConnected) {
    return res.json({ status: 'connected' })
  }
  if (!currentQR) {
    return res.json({ status: 'waiting' })
  }
  res.json({ status: 'ready', qr: currentQR })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🌐 QR Viewer buka di: http://localhost:${PORT}`)
})

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')

  const sock = makeWASocket({
    auth: state,
    browser: ["Ubuntu", "Chrome", "22.04.4"],
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log("✅ QR Code siap!")
      currentQR = await QRCode.toDataURL(qr)
    }

    if (connection === 'open') {
      console.log("✅ Bot sudah terhubung ke WhatsApp")
      isConnected = true
      currentQR = null
    }

    if (connection === 'close') {
      isConnected = false
      currentQR = null
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      console.log("❌ Koneksi terputus", lastDisconnect?.error)
      if (shouldReconnect) startBot()
      else console.log("🚪 Logout, hapus folder auth_info lalu jalankan ulang untuk scan QR")
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const fullJid = msg.key.remoteJid;
    if (!fullJid) return; 
    const fromNumber = fullJid.split('@')[0];

    const waAccount = await prisma.whatsAppAccount.findUnique({
      where: { phoneNumber: fromNumber },
      include: { user: true }
    });
    if (!waAccount || !waAccount.userId) {
      await sock.sendMessage(fullJid, { text: "⚠️ Nomor kamu belum terhubung ke akun user." });
      return;
    }
    const userId = waAccount.userId

    const sheet = await prisma.spreadsheetList.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    if (!sheet) {
      await sock.sendMessage(fullJid, { text: "⚠️ Kamu belum punya spreadsheet." })
      return
    }

    const sheetId = sheet.id

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text
    if (text) {
      console.log(`📩 Teks dari ${fromNumber}: ${text}`)
      await sock.sendMessage(fullJid, { text: `Halo 👋, kamu barusan kirim: "${text}"` })
    }

    const imageMsg = msg.message.imageMessage;
    if (imageMsg) {
      console.log(`📷 Gambar diterima dari ${fromNumber}`);
      let tempFile;
      try {
        const today = new Date().toISOString().split("T")[0];
        if (!waAccount.user.lastCreditReset || waAccount.user.lastCreditReset.toISOString().split("T")[0] !== today) {
          await prisma.user.update({
            where: { id: waAccount.userId },
            data: {
              credits: 3,
              lastCreditReset: new Date(),
            },
          });
          console.log("🔁 Kredit harian direset ke 3");
        }

        let updatedUser = waAccount.user;
        if (waAccount.user.userType === "free") {
          updatedUser = await prisma.user.update({
            where: { id: waAccount.userId },
            data: {
              credits: { decrement: 1 },
            },
            select: { credits: true },
          });

          if (updatedUser.credits < 0) {
            await prisma.user.update({
              where: { id: waAccount.userId },
              data: { credits: 0 },
            });
            await sock.sendMessage(fullJid, {
              text: "⚠️ Kredit harian kamu sudah habis. Silakan tunggu besok atau upgrade ke Pro 🚀",
            });
            return;
          }
        }

        const buffer = await downloadMediaMessage(msg, "buffer", {}, { logger: console });
        tempFile = tmp.fileSync({ postfix: ".jpg" });
        await fsPromises.writeFile(tempFile.name, buffer);
        console.log(`✅ Gambar disimpan sementara di ${tempFile.name}`);

        const FormData = require("form-data");
        const form = new FormData();
        form.append("file", fs.createReadStream(tempFile.name));
        form.append("user_type", waAccount.user.userType);

        let flaskRes;
        try {
          flaskRes = await axios.post("http://localhost:8000/process_invoice", form, {
            headers: form.getHeaders(),
            timeout: 120000,
          });
        } catch (flaskErr) {
          console.error("❌ Error saat request ke Flask:", flaskErr.response?.data || flaskErr.message);
          await sock.sendMessage(fullJid, {
            text: `⚠️ Gagal memproses invoice di Flask:\n${JSON.stringify(flaskErr.response?.data || flaskErr.message, null, 2)}`,
          });
          return;
        }

        const invoiceData = flaskRes.data.data;
        console.log("📄 Hasil dari Flask:", invoiceData);

        try {
          await axios.post(`http://localhost:5000/sheets/append/${userId}/${sheetId}`, { data: invoiceData });
          console.log("📡 Hasil dikirim ke API SPS");
        } catch (spsErr) {
          console.error("❌ Error saat kirim ke SPS:", spsErr.response?.data || spsErr.message);
          await sock.sendMessage(fullJid, {
            text: `⚠️ Gagal mengirim data ke spreadsheet:\n${JSON.stringify(spsErr.response?.data || spsErr.message, null, 2)}`,
          });
        }

        if (waAccount.user.userType === "free") {
          await sock.sendMessage(fullJid, {
            text: `✅ Invoice berhasil diproses. Kredit tersisa: ${updatedUser.credits}/3`,
          });
        } else {
          await sock.sendMessage(fullJid, {
            text: `✅ Invoice berhasil diproses (akun Pro, tanpa batasan kredit).`,
          });
        }
      } catch (err) {
        console.error("❌ Error umum saat proses gambar:", err.stack || err.message);
        await sock.sendMessage(fullJid, {
          text: `⚠️ Terjadi kesalahan saat memproses gambar:\n${err.stack || err.message}`,
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
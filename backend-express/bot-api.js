const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')
const fs = require('fs')
const fsPromises = fs.promises
const axios = require('axios')
const tmp = require('tmp')

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

    if (connection === 'open') {
      console.log("✅ Bot sudah terhubung ke WhatsApp")
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      console.log("❌ Koneksi terputus", lastDisconnect?.error)
      if (shouldReconnect) {
        console.log("🔄 Mencoba reconnect...")
        startBot()
      } else {
        console.log("🚪 Logout, hapus folder auth_info lalu jalankan ulang untuk scan QR")
      }
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const from = msg.key.remoteJid
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text

    if (text) {
      console.log(`📩 Teks dari ${from}: ${text}`)
      await sock.sendMessage(from, { text: `Halo 👋, saya bot. Kamu barusan kirim: "${text}"` })
    }

    const imageMsg = msg.message.imageMessage
    if (imageMsg) {
      console.log(`📷 Gambar diterima dari ${from}`)

      try {
        // Download buffer gambar
        const buffer = await downloadMediaMessage(msg, "buffer", {}, { logger: console })

        // Buat file sementara dengan tmp
        const tempFile = tmp.fileSync({ postfix: '.jpg' })
        await fsPromises.writeFile(tempFile.name, buffer)
        console.log(`✅ Gambar disimpan sementara di ${tempFile.name}`)

        // Kirim ke dummy OCR API
        const ocrRes = await axios.post("http://localhost:5000/ocr", { imagePath: tempFile.name })
        const extractedText = ocrRes.data.extractedText || "(OCR gagal)"
        console.log("📄 Hasil OCR:", extractedText)

        // Kirim ke dummy LLM API
        const llmRes = await axios.post("http://localhost:5000/llm", { text: extractedText })
        const llmReply = llmRes.data.reply || extractedText

        // Balas ke user
        await sock.sendMessage(from, { text: `📄 Hasil OCR + LLM dikirim ke sps mu:\n${llmReply}` })

        // Kirim hasil ke API eksternal
        await axios.post("http://localhost:5000/save-result", {
          sender: from,
          ocr: extractedText,
          llm: llmReply,
          timestamp: Date.now()
        })
        console.log("📡 Hasil dikirim ke API save-result")

      } catch (err) {
        console.error("❌ Error OCR/LLM:", err.message)
        await sock.sendMessage(from, { text: "⚠️ Gagal memproses gambar." })
      } finally {
        // File temporary otomatis dihapus saat process exit
        console.log(`🗑️ File sementara ${imageMsg?.fileName || ''} akan dibersihkan otomatis`)
      }
    }
  })
}

startBot()

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { phoneNumber, spreadsheetId, userId } = await req.json();

  if (!phoneNumber || !spreadsheetId || !userId) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }

  // cari atau buat akun WA
  let waAccount = await prisma.whatsAppAccount.findUnique({
    where: { phoneNumber },
  });

  if (!waAccount) {
    waAccount = await prisma.whatsAppAccount.create({
      data: { phoneNumber, userId }, // ✅ simpan userId
    });
  }

  // buat koneksi (replace yang lama)
  await prisma.spreadsheetConnection.deleteMany({
    where: { waAccountId: waAccount.id },
  });

  const connection = await prisma.spreadsheetConnection.create({
    data: { waAccountId: waAccount.id, spreadsheetId },
  });

  return NextResponse.json(connection);
}

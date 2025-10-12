import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // ✅ Ganti import path

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json([], { status: 401 });

  const spreadsheets = await prisma.spreadsheetList.findMany({
    where: { userId: session.user.id },
  });

  return NextResponse.json(spreadsheets);
}

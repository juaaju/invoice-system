"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut, useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {useEffect} from "react";

interface Spreadsheet {
  id: string;
  name: string;
  createdAt: string;
  spreadsheetUrl: string;
  // userId: string;
}

interface User {
  name: string;
}

export default function DashboardPage() {
  const [showModal, setShowModal] = useState(false)
  const {data:session, status} = useSession();
  const router = useRouter();
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState("");

// ... useEffect ambil data seperti sudah kamu buat

  const [loading, setLoading] = useState(false);
  const [sheetName, setSheetName] = useState("");
  const [result, setResult] = useState<{ url?: string; spreadsheetId?: string; error?: string } | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    // ambil info user
    fetch("/api/user")
      .then(res => res.json())
      .then((data) => setUser(data));

    // ambil spreadsheets milik user
    fetch("/api/spreadsheets")
      .then(res => res.json())
      .then((data) => setSpreadsheets(data));
  }, [status]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSheet, setEditingSheet] = useState<Spreadsheet | null>(null);
  const [nameSheet, setNameSheet] = useState("");
  const userId = session?.user?.id as string | undefined;
  // ambil userId misalnya dari props atau session

  const handleEdit = (sheet: Spreadsheet) => {
    setEditingSheet(sheet);
    setNameSheet(sheet.name);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSheet) return;

    try {
      const res = await fetch(`http://localhost:5000/sheets/update/${userId}/${editingSheet.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: nameSheet }),
      });

      if (!res.ok) throw new Error("Gagal update sheet");

      const data = await res.json();

      // update state lokal dengan hasil dari server
      const updatedSheets = spreadsheets.map((sheet) =>
        sheet.id === editingSheet.id ? { ...sheet, name: data.name } : sheet
      );

      setSpreadsheets(updatedSheets);
      setEditingSheet(null);
      setNameSheet("");
    } catch (err) {
      console.error(err);
      alert("Gagal update spreadsheet");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus spreadsheet ini?")) return;

    try {
      const res = await fetch(`http://localhost:5000/sheets/${userId}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal hapus sheet");

      setSpreadsheets(spreadsheets.filter((sheet) => sheet.id !== id));
    } catch (err) {
      console.error(err);
      alert("Gagal hapus spreadsheet");
    }
  };


  const openSpreadsheet = (spreadsheetUrl: string) => {
    window.open(spreadsheetUrl, "_blank");
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login"); // redirect kalau belum login
    }
  }, [status, router]);

  // if (status === "loading") {
  //   return <p>Loading...</p>;
  // }
  // hanlde create sps

  const handleCreateSheet = async () => {
    if (!userId) {
      alert("UserId tidak ditemukan di session");
      return;
    }

    if (!nameSheet.trim()) {
      alert("Nama spreadsheet wajib diisi");
      return;
    }

    setLoading(true);
    try {
      // pakai relative path, otomatis diproxy ke :5000
      const res = await fetch(`http://localhost:5000/sheets/create/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameSheet }),
      });


      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Status: ${res.status}, Body: ${text}`);
      }

      const data = await res.json();
      console.log("Sheet created:", data);

      setResult(data);

      // reset form dan tutup modal
      setNameSheet("");
      setShowCreateModal(false);

      // kalau ada function buat refresh daftar sheet
      // fetchSheets();
    
    } catch (err: any) {
      console.error("❌ Error di frontend:", err);

      // tampilkan error di console atau UI, jangan popup
      // alert(err.message || "Terjadi error"); ❌ ini yang bikin popup
      setResult({ error: err.message || "Terjadi error" });
    } finally {
      setLoading(false);
    }

  };

  const [phoneNumber, setPhoneNumber] = useState("");

  const handleConnect = async () => {
    const res = await fetch("/api/wa-connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber,
        spreadsheetId: selectedSpreadsheet,
        userId: userId, // ✅ kirim dari frontend
      }),
    });

    if (res.ok) {
      console.log("Berhasil konek!");
      alert("✅ Koneksi berhasil!");
      setShowModal(false);
    } else {
      console.error("Gagal konek");
      alert("❌ Gagal konek, coba lagi.");
    }
  };



  return (
    
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">InvoiceFlow</h1>
              <span className="text-gray-400 hidden sm:inline">|</span>
              <span className="text-gray-600 hidden sm:inline">Dashboard</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button onClick={() => setShowModal(true)} className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 sm:gap-2">
                <span>📱</span>
                <span className="hidden sm:inline">Konek WA</span>
              </button>
              <button
                onClick={() => router.push("https://drive.google.com/file/d/16sTeLlfwBgGRJpyKfBI8B9pnuveO8d5N/view?usp=sharing")}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 sm:gap-2"
              >
                <span>❓</span>
                <span className="hidden sm:inline">Cara Pakai</span>
              </button>
              <div className="text-sm text-gray-600 hidden md:block">
                Halo, <span className="font-semibold">{user?.name}</span>
              </div>
              <button
                onClick={() => {
                  if (window.confirm("Yakin ingin logout?")) {
                    signOut({ callbackUrl: "/login" })
                  }
                }}
                className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Total Spreadsheet Invoice</h2>
                <p className="text-3xl font-bold text-blue-600 mt-2">{spreadsheets.length}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg">
                <span className="text-3xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Spreadsheet Management */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Kelola Spreadsheet</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                + Buat Spreadsheet
              </button>
            </div>
          </div>

          {/* Spreadsheet List */}
          <div className="p-6">
            {spreadsheets.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📄</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada spreadsheet</h3>
                <p className="text-gray-600">Buat spreadsheet pertama Anda untuk mulai mengelola invoice</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {spreadsheets.map((sheet) => (
                  <div key={sheet.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <span className="text-xl">📊</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{sheet.name}</h3>
                          <p className="text-sm text-gray-600">Dibuat: {new Date(sheet.createdAt).toLocaleDateString('id-ID')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openSpreadsheet(sheet.spreadsheetUrl)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Buka
                        </button>
                        <button
                          onClick={() => handleEdit(sheet)}
                          className="text-blue-600 hover:text-blue-800 px-3 py-2 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(sheet.id)}
                          className="text-red-600 hover:text-red-800 px-3 py-2 text-sm font-medium"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingSheet) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingSheet ? "Edit Nama Spreadsheet" : "Buat Spreadsheet Baru"}
            </h3>
            
            <form onSubmit={editingSheet ? handleUpdate : handleCreateSheet} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Spreadsheet</label>
                <input
                  type="text"
                  value={nameSheet}
                  onChange={(e) => setNameSheet(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: Invoice Januari 2024"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingSheet(null);
                    setNameSheet("");
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingSheet ? "Update" : "Buat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">Koneksi WhatsApp</h2>
            <p className="text-sm text-gray-600 mb-6">
              Masukan no WA kamu dan pilih Spreadsheet untuk koneksi. Kemudian chat ke nomor bot 08xxxxxxx
            </p>

            {/* Input Nomor WA */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor WhatsApp
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Contoh: 6281234567890"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Dropdown Spreadsheet */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pilih Spreadsheet
              </label>
              <select
                value={selectedSpreadsheet}
                onChange={(e) => setSelectedSpreadsheet(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih Spreadsheet --</option>
                {spreadsheets.map((sheet) => (
                  <option key={sheet.id} value={sheet.id}>
                    {sheet.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tombol Aksi */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Tutup
              </button>
              <button
                onClick={handleConnect}
                className="px-4 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                disabled={!selectedSpreadsheet || !phoneNumber}
              >
                Konek
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
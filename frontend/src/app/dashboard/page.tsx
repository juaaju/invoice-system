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

  // const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([
  //   {
  //     id: "1",
  //     nama: "Invoice Januari 2024",
  //     tanggal_dibuat: "2024-01-15",
  //     url: "https://docs.google.com/spreadsheets/d/example-1"
  //   },
  //   {
  //     id: "2", 
  //     nama: "Invoice Februari 2024",
  //     tanggal_dibuat: "2024-02-01",
  //     url: "https://docs.google.com/spreadsheets/d/example-2"
  //   },
  //   {
  //     id: "3",
  //     nama: "Laporan Keuangan Q1",
  //     tanggal_dibuat: "2024-03-31",
  //     url: "https://docs.google.com/spreadsheets/d/example-3"
  //   }
  // ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSheet, setEditingSheet] = useState<Spreadsheet | null>(null);
  const [nameSheet, setNameSheet] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newSheet: Spreadsheet = {
      id: Date.now().toString(),
      name: nameSheet,
      createdAt: new Date().toISOString().split('T')[0],
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/new-${Date.now()}`
    };
    setSpreadsheets([...spreadsheets, newSheet]);
    setShowCreateModal(false);
    setNameSheet("");
  };

  const handleEdit = (sheet: Spreadsheet) => {
    setEditingSheet(sheet);
    setNameSheet(sheet.name);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSheet) return;
    
    const updatedSheets = spreadsheets.map(sheet => 
      sheet.id === editingSheet.id 
        ? { ...sheet, nama: nameSheet }
        : sheet
    );
    setSpreadsheets(updatedSheets);
    setEditingSheet(null);
    setNameSheet("");
  };

  const handleDelete = (id: string) => {
    if (confirm("Yakin ingin menghapus spreadsheet ini?")) {
      setSpreadsheets(spreadsheets.filter(sheet => sheet.id !== id));
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">InvoiceFlow</h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setShowModal(true)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                <span>📱</span>
                Konek WA
              </button>
              <button
                onClick={() => router.push("https://www.youtube.com/watch?v=PAOy-bCk8EU")}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <span>❓</span>
                Cara Pakai
              </button>
              <div className="text-sm text-gray-600">
                Halo, <span className="font-semibold">{user?.name}</span>
              </div>
              <button
                onClick={() => {
                  if (window.confirm("Yakin ingin logout?")) {
                    signOut({ callbackUrl: "/login" })
                  }
                }}
                className="text-gray-500 hover:text-gray-700"
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
                          <p className="text-sm text-gray-600">Dibuat: {sheet.createdAt}</p>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingSheet ? "Edit Nama Spreadsheet" : "Buat Spreadsheet Baru"}
            </h3>
            
            <form onSubmit={editingSheet ? handleUpdate : handleCreate} className="space-y-4">
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
              Scan QR Code untuk menghubungkan WhatsApp kamu 📱
            </p>
            <div className="flex justify-center mb-6">
              <div className="w-40 h-40 bg-gray-200 flex items-center justify-center text-gray-500">
                QR CODE
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
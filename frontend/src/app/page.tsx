import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Header - Fixed */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-gray-900">InvoiceFlow</div>
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-full font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                Masuk
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Full Screen */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-blue-50 to-gray-50 pt-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Invoice via WhatsApp
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Otomatis</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Kirim invoice ke WhatsApp, data langsung tercatat di Spreadsheet. Praktis tanpa ribet, pas untuk mahasiswa maupun bisnis kecil
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                href="/login" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
              >
                Coba Gratis
              </Link>
              <Link 
                href="https://drive.google.com/file/d/16sTeLlfwBgGRJpyKfBI8B9pnuveO8d5N/view?usp=sharing" 
                className="border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 px-10 py-4 rounded-full font-semibold text-lg transition-all duration-200 bg-white hover:bg-blue-50"
              >
                Lihat Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Full Screen */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-6 w-full">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Pilih Paket Terbaik untuk Anda
            </h2>
            <p className="text-xl text-gray-600">Mulai gratis, upgrade kapan saja</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-green-100 to-green-200 w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
                <span className="text-3xl">🆓</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-8">
                Rp 0<span className="text-xl font-normal text-gray-600">/bulan</span>
              </div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-4">
                  <span className="text-green-500 font-bold text-xl">✓</span>
                  <span className="text-gray-600 text-lg">3 invoice per hari</span>
                </li>
                <li className="flex items-center gap-4">
                  <span className="text-green-500 font-bold text-xl">✓</span>
                  <span className="text-gray-600 text-lg">Kirim via WhatsApp</span>
                </li>
                <li className="flex items-center gap-4">
                  <span className="text-green-500 font-bold text-xl">✓</span>
                  <span className="text-gray-600 text-lg">Auto ke Spreadsheet</span>
                </li>
                <li className="flex items-center gap-4">
                  <span className="text-gray-400 font-bold text-xl">✕</span>
                  <span className="text-gray-400 text-lg">Template kustom</span>
                </li>
              </ul>
              <Link href="/register" className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-4 rounded-full font-semibold text-lg text-center block transition-all duration-200 hover:shadow-md">
                Mulai Gratis
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-white p-8 rounded-2xl shadow-2xl border-2 border-blue-200 relative transform scale-105 hover:scale-110 transition-all duration-300">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">Paling Populer</span>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
                <span className="text-3xl">⭐</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Pro</h3>
              <div className="text-4xl font-bold text-gray-900 mb-8">
                Rp 30.000<span className="text-xl font-normal text-gray-600">/bulan</span>
              </div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-4">
                  <span className="text-green-500 font-bold text-xl">✓</span>
                  <span className="text-gray-600 text-lg">Invoice unlimited</span>
                </li>
                <li className="flex items-center gap-4">
                  <span className="text-green-500 font-bold text-xl">✓</span>
                  <span className="text-gray-600 text-lg">Semua fitur Free</span>
                </li>
                <li className="flex items-center gap-4">
                  <span className="text-green-500 font-bold text-xl">✓</span>
                  <span className="text-gray-600 text-lg">Template kustom</span>
                </li>
                <li className="flex items-center gap-4">
                  <span className="text-green-500 font-bold text-xl">✓</span>
                  <span className="text-gray-600 text-lg">Priority support</span>
                </li>
              </ul>
              <Link href="/register?plan=pro" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-full font-semibold text-lg text-center block transition-all duration-200 shadow-lg hover:shadow-xl">
                Pilih Pro
              </Link>
            </div>

            {/* API Plan */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-2">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 w-16 h-16 rounded-2xl flex items-center justify-center mb-8">
                <span className="text-3xl">🔌</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">API</h3>
              <div className="text-4xl font-bold text-gray-900 mb-8">
                Rp 500<span className="text-xl font-normal text-gray-600">/hit</span>
              </div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-4">
                  <span className="text-green-500 font-bold text-xl">✓</span>
                  <span className="text-gray-600 text-lg">Pay per use</span>
                </li>
                <li className="flex items-center gap-4">
                  <span className="text-green-500 font-bold text-xl">✓</span>
                  <span className="text-gray-600 text-lg">REST API access</span>
                </li>
                <li className="flex items-center gap-4">
                  <span className="text-green-500 font-bold text-xl">✓</span>
                  <span className="text-gray-600 text-lg">Dokumentasi lengkap</span>
                </li>
                <li className="flex items-center gap-4">
                  <span className="text-green-500 font-bold text-xl">✓</span>
                  <span className="text-gray-600 text-lg">Developer support</span>
                </li>
              </ul>
              <Link href="/api-docs" className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 rounded-full font-semibold text-lg text-center block transition-all duration-200 shadow-lg hover:shadow-xl">
                Beli API
              </Link>
            </div>
            
          </div>
        </div>
      </section>

      {/* CTA Section - Full Screen */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 via-white to-white-50">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8">
              Mulai Kelola Invoice Anda
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Bergabung dengan ribuan pengguna yang sudah memakai InvoiceFlow
            </p>
            <Link 
              href="/login" 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-12 py-5 rounded-full font-semibold text-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Coba Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">InvoiceFlow</div>
              <p className="text-gray-400 text-md">
                Solusi pencatatan invoice otomatis praktis.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-xl">Produk</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Fitur</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Harga</Link></li>
                <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-xl">Dukungan</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Bantuan</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Kontak</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Dokumentasi</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-xl">Perusahaan</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">Tentang</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privasi</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 InvoiceFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
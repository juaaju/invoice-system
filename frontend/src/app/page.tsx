import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Header - Fixed */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">InvoiceFlow</div>
            <Link 
              href="/login" 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-medium text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-200"
            >
              Masuk
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-blue-50 to-gray-50 pt-24 pb-12 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 leading-tight px-2">
              Invoice via WhatsApp
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"> Otomatis</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              Kirim invoice ke WhatsApp, data langsung tercatat di Spreadsheet. Praktis tanpa ribet, pas untuk mahasiswa maupun bisnis kecil
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4">
              <Link 
                href="/login" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
              >
                Coba Gratis
              </Link>
              <Link 
                href="https://drive.google.com/file/d/16sTeLlfwBgGRJpyKfBI8B9pnuveO8d5N/view?usp=sharing" 
                className="border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 px-8 sm:px-10 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg transition-all duration-200 bg-white hover:bg-blue-50"
              >
                Lihat Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 via-blue-50 to-indigo-50 py-16 px-4">
        <div className="container mx-auto w-full">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              Pilih Paket Terbaik untuk Anda
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">Mulai gratis, upgrade kapan saja</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            
            {/* Free Plan */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
              <div className="bg-gradient-to-br from-green-100 to-green-200 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-6 sm:mb-8">
                <span className="text-2xl sm:text-3xl">🆓</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Free</h3>
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">
                Rp 0<span className="text-lg sm:text-xl font-normal text-gray-600">/bulan</span>
              </div>
              <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                <li className="flex items-center gap-3 sm:gap-4">
                  <span className="text-green-500 font-bold text-lg sm:text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-600 text-base sm:text-lg">3 invoice per hari</span>
                </li>
                <li className="flex items-center gap-3 sm:gap-4">
                  <span className="text-gray-400 font-bold text-lg sm:text-xl flex-shrink-0">✕</span>
                  <span className="text-gray-400 text-base sm:text-lg">Fitur handwriting invoice</span>
                </li>
                <li className="flex items-center gap-3 sm:gap-4">
                  <span className="text-gray-400 font-bold text-lg sm:text-xl flex-shrink-0">✕</span>
                  <span className="text-gray-400 text-base sm:text-lg">Template spreadsheet kustom</span>
                </li>
                <li className="flex items-center gap-3 sm:gap-4">
                  <span className="text-gray-400 font-bold text-lg sm:text-xl flex-shrink-0">✕</span>
                  <span className="text-gray-400 text-base sm:text-lg">Multi WA</span>
                </li>
              </ul>
              <Link href="/login" className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg text-center block transition-all duration-200 hover:shadow-md">
                Mulai Gratis
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl border-2 border-blue-200 relative sm:scale-105">
              <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg whitespace-nowrap">Akses tanpa batas</span>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-6 sm:mb-8 mt-4 sm:mt-0">
                <span className="text-2xl sm:text-3xl">⭐</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Pro</h3>
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">
                Rp 50.000<span className="text-lg sm:text-xl font-normal text-gray-600">/bulan</span>
              </div>
              <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                <li className="flex items-center gap-3 sm:gap-4">
                  <span className="text-green-500 font-bold text-lg sm:text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-600 text-base sm:text-lg">Invoice unlimited</span>
                </li>
                <li className="flex items-center gap-3 sm:gap-4">
                  <span className="text-green-500 font-bold text-lg sm:text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-600 text-base sm:text-lg">Fitur handwriting invoice</span>
                </li>
                <li className="flex items-center gap-3 sm:gap-4">
                  <span className="text-green-500 font-bold text-lg sm:text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-600 text-base sm:text-lg">Template spreadsheet kustom</span>
                </li>
                <li className="flex items-center gap-3 sm:gap-4">
                  <span className="text-green-500 font-bold text-lg sm:text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-600 text-base sm:text-lg">Multi WA</span>
                </li>
              </ul>
              <Link href="/maintenance" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg text-center block transition-all duration-200 shadow-lg hover:shadow-xl">
                Pilih Pro
              </Link>
            </div>

            {/* API Plan */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 sm:col-span-2 lg:col-span-1">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-6 sm:mb-8">
                <span className="text-2xl sm:text-3xl">🔌</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">API</h3>
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">
                Rp 500<span className="text-lg sm:text-xl font-normal text-gray-600">/hit</span>
              </div>
              <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
                <li className="flex items-center gap-3 sm:gap-4">
                  <span className="text-green-500 font-bold text-lg sm:text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-600 text-base sm:text-lg">Pay per use</span>
                </li>
                <li className="flex items-center gap-3 sm:gap-4">
                  <span className="text-green-500 font-bold text-lg sm:text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-600 text-base sm:text-lg">REST API access</span>
                </li>
                <li className="flex items-center gap-3 sm:gap-4">
                  <span className="text-green-500 font-bold text-lg sm:text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-600 text-base sm:text-lg">Dokumentasi lengkap</span>
                </li>
                <li className="flex items-center gap-3 sm:gap-4">
                  <span className="text-green-500 font-bold text-lg sm:text-xl flex-shrink-0">✓</span>
                  <span className="text-gray-600 text-base sm:text-lg">Developer support</span>
                </li>
              </ul>
              <Link href="/maintenance" className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg text-center block transition-all duration-200 shadow-lg hover:shadow-xl">
                Beli API
              </Link>
            </div>
            
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 via-white to-white-50 py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 sm:mb-8 px-4">
              Mulai Kelola Invoice Anda
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto px-4">
              Kirim invoice ke WhatsApp, data langsung tercatat di Spreadsheet. Praktis tanpa ribet, pas untuk mahasiswa maupun bisnis kecil
            </p>
            <Link 
              href="/login" 
              className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 sm:px-12 py-4 sm:py-5 rounded-full font-semibold text-lg sm:text-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Coba Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">InvoiceFlow</div>
              <p className="text-gray-400 text-sm sm:text-base">
                Solusi pencatatan invoice otomatis praktis.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 sm:mb-6 text-lg sm:text-xl">Produk</h4>
              <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
                <li><Link href="/features" className="hover:text-white transition-colors">Fitur</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Harga</Link></li>
                <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 sm:mb-6 text-lg sm:text-xl">Dukungan</h4>
              <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
                <li><Link href="/help" className="hover:text-white transition-colors">Bantuan</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Kontak</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Dokumentasi</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 sm:mb-6 text-lg sm:text-xl">Perusahaan</h4>
              <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
                <li><Link href="/about" className="hover:text-white transition-colors">Tentang</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privasi</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-400 text-sm sm:text-base">
            <p>&copy; 2025 InvoiceFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
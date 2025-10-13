import React from 'react';
import { Wrench, Clock, Mail } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Icon Animation */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-full">
                <Wrench className="w-12 h-12 text-white animate-bounce" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Sedang dalam Pengembangan
          </h1>

          {/* Description */}
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            Kami sedang melakukan pengembangan lebih lanjut untuk meningkatkan performa dan pengalaman Anda. 
          </p>
        </div>

        {/* Footer Text */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Terima kasih atas kesabaran Anda 🙏
        </p>
      </div>
    </div>
  );
}
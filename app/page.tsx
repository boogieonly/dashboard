'use client';

import React from 'react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 flex flex-col items-center justify-center p-24 relative overflow-hidden">
      {/* Subtle background particles */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Banner */}
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent mb-20 drop-shadow-2xl animate-float z-10 relative">
        🚀 Hub Comercial de Inteligência
      </h1>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl w-full z-10">
        {/* Card 1 */}
        <div className="group h-96 bg-white/5 backdrop-blur-3xl border border-white/20 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-2xl hover:shadow-3xl hover:shadow-blue-500/50 hover:-translate-y-6 transition-all duration-700 cursor-pointer overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="text-7xl mb-8 drop-shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 filter brightness-110">🤖</div>
          <h2 className="text-3xl font-bold text-white mb-6 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent drop-shadow-lg relative z-10">AI Analytics</h2>
          <p className="text-gray-300 text-lg mb-10 max-w-md leading-relaxed relative z-10">Unlock powerful insights with cutting-edge AI analytics.</p>
          <button className="px-10 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-blue-400/50 transition-all duration-300 transform hover:scale-110 active:scale-105 relative z-10 border-2 border-white/30">
            Explore →
          </button>
        </div>

        {/* Card 2 */}
        <div className="group h-96 bg-white/5 backdrop-blur-3xl border border-white/20 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-2xl hover:shadow-3xl hover:shadow-green-500/50 hover:-translate-y-6 transition-all duration-700 cursor-pointer overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="text-7xl mb-8 drop-shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 filter brightness-110">📈</div>
          <h2 className="text-3xl font-bold text-white mb-6 bg-gradient-to-r from-white to-green-300 bg-clip-text text-transparent drop-shadow-lg relative z-10">Predictive Sales</h2>
          <p className="text-gray-300 text-lg mb-10 max-w-md leading-relaxed relative z-10">Forecast sales trends with precision using predictive models.</p>
          <button className="px-10 py-4 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-green-400/50 transition-all duration-300 transform hover:scale-110 active:scale-105 relative z-10 border-2 border-white/30">
            Dive In →
          </button>
        </div>

        {/* Card 3 */}
        <div className="group h-96 bg-white/5 backdrop-blur-3xl border border-white/20 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-2xl hover:shadow-3xl hover:shadow-purple-500/50 hover:-translate-y-6 transition-all duration-700 cursor-pointer overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="text-7xl mb-8 drop-shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 filter brightness-110">👥</div>
          <h2 className="text-3xl font-bold text-white mb-6 bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent drop-shadow-lg relative z-10">Customer Insights</h2>
          <p className="text-gray-300 text-lg mb-10 max-w-md leading-relaxed relative z-10">Deep dive into customer behavior and preferences.</p>
          <button className="px-10 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-purple-400/50 transition-all duration-300 transform hover:scale-110 active:scale-105 relative z-10 border-2 border-white/30">
            Discover →
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}

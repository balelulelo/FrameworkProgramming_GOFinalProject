import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CafeCard from './components/CafeCard';
import DetailModal from './components/DetailModal';

function App() {
  const [cafes, setCafes] = useState([]);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // FETCH DATA DARI GO BACKEND
  useEffect(() => {
    const fetchCafes = async () => {
      try {
        // Asumsi backend jalan di localhost:8080
        const response = await axios.get('http://localhost:8080/cafes');
        // Backend Go mengembalikan { "cafes": [...] }
        setCafes(response.data.cafes); 
      } catch (error) {
        console.error("Gagal mengambil data kafe:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCafes();
  }, []);

  return (
    <div className="min-h-screen pb-20">
      
      {/* HEADER */}
      <header className="bg-black bg-opacity-50 backdrop-blur-md sticky top-0 z-40 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1DB954] tracking-tight">
                <i className="fas fa-mug-hot mr-2"></i>Cafetify 
            </h1>
            <div>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-[#1DB954] hover:bg-green-400 text-black font-bold py-2 px-6 rounded-full shadow-lg transform transition hover:scale-105"
                >
                    Tambah Kafe
                </button>
            </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* FILTER SECTION */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 justify-between items-center">
            <div className="relative w-full md:w-1/3">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <i className="fas fa-search"></i>
                </span>
                <input 
                  type="text" 
                  placeholder="Cari koleksimu..." 
                  className="w-full py-2 pl-10 pr-4 bg-[#2a2a2a] border-none rounded-full text-white focus:ring-2 focus:ring-[#1DB954] outline-none"
                />
            </div>
            
            <div className="flex gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                {['Semua', 'Kopi Strong', 'Sunyi', 'Aesthetic'].map(filter => (
                  <button key={filter} className="px-4 py-1 bg-[#333] rounded-full text-sm hover:bg-[#444] whitespace-nowrap transition text-white">
                    {filter}
                  </button>
                ))}
            </div>
        </div>

        {/* GRID DAFTAR KAFE */}
        <h2 className="text-xl font-bold mb-6 text-white">Koleksi Terbaru</h2>
        
        {loading ? (
           <p className="text-white">Memuat data...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {cafes.map((cafe) => (
                <CafeCard 
                  key={cafe.ID} 
                  cafe={cafe} 
                  onClick={setSelectedCafe} 
                />
              ))}
          </div>
        )}
      </main>

      {/* MODALS */}
      {selectedCafe && (
        <DetailModal 
          cafe={selectedCafe} 
          onClose={() => setSelectedCafe(null)} 
        />
      )}

      {/* Simple Add Modal Placeholder (Sesuai HTML) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
             <div className="bg-[#181818] rounded-xl w-full max-w-lg shadow-2xl border border-[#333] p-6">
                <h3 className="text-2xl font-bold text-white mb-6">Tambah Kafe Baru</h3>
                <p className="text-gray-400 mb-4">Fitur ini memerlukan integrasi form ke endpoint POST /protected/cafe dan /rate.</p>
                <div className="flex justify-end gap-3 pt-4">
                    <button onClick={() => setIsAddModalOpen(false)} className="px-6 py-2 text-gray-400 hover:text-white font-bold transition">Tutup</button>
                </div>
             </div>
        </div>
      )}

    </div>
  );
}

export default App;
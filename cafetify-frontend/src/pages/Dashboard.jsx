import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // PENTING: Untuk navigasi
import CafeCard from '../components/CafeCard';
import DetailModal from '../components/DetailModal';

// Ganti nama fungsi jadi Dashboard
const Dashboard = () => {
  const [cafes, setCafes] = useState([]);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate(); // Hook untuk pindah halaman

  // FETCH DATA DARI GO BACKEND
  useEffect(() => {
    const fetchCafes = async () => {
      const token = localStorage.getItem('token'); // Ambil token dari penyimpanan lokal

      // Jika tidak ada token, paksa user login dulu
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // PERUBAHAN 1: URL disesuaikan dengan backend (/api/cafes)
        // PERUBAHAN 2: Kirim Header Authorization
        const response = await axios.get('http://localhost:8080/api/cafes', {
          headers: {
            Authorization: token // Kirim token JWT ke Go
          }
        });
        
        setCafes(response.data.cafes); 
      } catch (error) {
        console.error("Gagal mengambil data kafe:", error);
        // Jika token expired atau invalid (401), lempar ke login
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCafes();
  }, [navigate]);

  // Fungsi Logout Sederhana
  const handleLogout = () => {
      localStorage.removeItem('token');
      navigate('/login');
  };

  return (
    <div className="min-h-screen pb-20 bg-black text-white"> 
      {/* Pastikan bg-black agar sesuai tema */}
      
      {/* HEADER */}
      <header className="bg-black bg-opacity-50 backdrop-blur-md sticky top-0 z-40 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1DB954] tracking-tight">
                <i className="fas fa-mug-hot mr-2"></i>Cafetify 
            </h1>
            <div className="flex gap-4">
                <button 
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white font-semibold py-2 px-4 transition"
                >
                    Logout
                </button>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-[#1DB954] hover:bg-green-400 text-black font-bold py-2 px-6 rounded-full shadow-lg transform transition hover:scale-105"
                >
                    Tambah Kafe
                </button>
            </div>
        </div>
      </header>

      {/* MAIN CONTENT (Sama seperti sebelumnya) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* FILTER SECTION (Sama seperti sebelumnya) */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 justify-between items-center">
             {/* ... (Kode Search input & Filter buttons tetap sama) ... */}
             <div className="relative w-full md:w-1/3">
                 {/* Placeholder UI Filter Anda */}
                 <input type="text" placeholder="Cari..." className="w-full py-2 px-4 bg-[#2a2a2a] rounded-full text-white"/>
             </div>
        </div>

        {/* GRID DAFTAR KAFE */}
        <h2 className="text-xl font-bold mb-6 text-white">Koleksi Terbaru</h2>
        
        {loading ? (
           <p className="text-gray-400">Memuat data...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {cafes.map((cafe) => (
                <CafeCard 
                  key={cafe.ID} 
                  cafe={cafe} 
                  // Pastikan CafeCard Anda menangani klik ini
                  onClick={() => setSelectedCafe(cafe)} 
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

      {isAddModalOpen && (
        // Modal Placeholder Anda
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
             <div className="bg-[#181818] rounded-xl w-full max-w-lg shadow-2xl border border-[#333] p-6">
                <h3 className="text-2xl font-bold text-white mb-6">Tambah Kafe Baru</h3>
                <p className="text-gray-400 mb-4">Fitur Create Cafe akan diimplementasikan di sini.</p>
                <button onClick={() => setIsAddModalOpen(false)} className="text-white bg-red-600 px-4 py-2 rounded">Tutup</button>
             </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;
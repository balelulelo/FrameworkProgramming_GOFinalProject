import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CafeCard from '../components/CafeCard';
import DetailModal from '../components/DetailModal';
import AddCafeModal from '../components/AddCafeModal';

const Dashboard = () => {
    const [cafes, setCafes] = useState([]);
    const [selectedCafe, setSelectedCafe] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [cafeToEdit, setCafeToEdit] = useState(null); // State for editing
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('Semua');
    const [searchQuery, setSearchQuery] = useState(''); // State for search
    const [tags, setTags] = useState([]); // State for dynamic tags

    const navigate = useNavigate();

    // Fetch Tags
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await axios.get('http://localhost:8080/tags');
                setTags(response.data.tags);
            } catch (error) {
                console.error("Gagal ambil tags:", error);
            }
        };
        fetchTags();
    }, []);

    // Fetch Cafes (Triggered by activeFilter change)
    useEffect(() => {
        const fetchCafes = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                setLoading(true);
                // Add tag filter and search query
                const queryParams = [];
                if (activeFilter !== 'Semua') queryParams.push(`tag=${encodeURIComponent(activeFilter)}`);
                if (searchQuery) queryParams.push(`search=${encodeURIComponent(searchQuery)}`);

                const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
                const url = `http://localhost:8080/cafes${queryString}`;

                const response = await axios.get(url, {
                    headers: { Authorization: token }
                });
                setCafes(response.data.cafes);
            } catch (error) {
                console.error("Gagal ambil data:", error);
                if (error.response?.status === 401) navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchCafes();
    }, [navigate, activeFilter, searchQuery]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Combine 'Semua' with fetched tags
    const filters = ['Semua', ...tags.map(t => t.name)];

    return (
        <div className="flex h-screen bg-black overflow-hidden font-sans text-white">

            {/* =======================
          1. SIDEBAR (Kiri) 
         ======================= */}
            <aside className="w-[280px] bg-black flex flex-col gap-2 p-2 flex-shrink-0">

                {/* A. Menu Utama (Home/Search) - Kotak Atas */}
                <div className="bg-[#121212] rounded-lg p-6 flex flex-col gap-5">
                    <div className="flex items-center gap-2 mb-2">
                        <i className="fas fa-coffee text-2xl text-white"></i>
                        <span className="font-bold text-xl tracking-tight">Cafetify</span>
                    </div>
                    <nav className="flex flex-col gap-5 font-bold text-[#b3b3b3]">
                        <a href="#" className="flex items-center gap-4 text-white transition-colors">
                            <i className="fas fa-home text-xl w-6 text-center"></i> Home
                        </a>
                        <a href="#" className="flex items-center gap-4 hover:text-white transition-colors">
                            <i className="fas fa-search text-xl w-6 text-center"></i> Search
                        </a>
                    </nav>
                </div>

                {/* B. Library Menu - Kotak Bawah (Expand) */}
                <div className="bg-[#121212] rounded-lg flex-1 flex flex-col overflow-hidden">
                    {/* Library Header */}
                    <div className="p-4 px-6 flex justify-between items-center shadow-md z-10">
                        <button className="flex items-center gap-3 text-[#b3b3b3] hover:text-white font-bold transition">
                            <i className="fas fa-book text-lg"></i>
                            <span>Koleksi Kamu</span>
                        </button>
                        <div className="flex gap-2">
                            <button onClick={() => setIsAddModalOpen(true)} className="text-[#b3b3b3] hover:text-white hover:bg-[#2a2a2a] w-8 h-8 rounded-full flex items-center justify-center transition">
                                <i className="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>

                    {/* List Menu (Liked Songs & Create Playlist) */}
                    <div className="p-2 overflow-y-auto custom-scrollbar flex-1">
                        {/* Liked Songs Button */}
                        <button className="w-full flex items-center gap-3 p-2 rounded hover:bg-[#1a1a1a] transition group cursor-pointer text-left">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#450af5] to-[#c4efd9] rounded-sm flex items-center justify-center opacity-80 group-hover:opacity-100">
                                <i className="fas fa-heart text-white"></i>
                            </div>
                            <div>
                                <p className="font-bold text-white">Kafe Favorit</p>
                                <p className="text-xs text-[#b3b3b3] flex items-center gap-1">
                                    <i className="fas fa-thumbtack text-[10px] text-[#1DB954]"></i> Pinned
                                </p>
                            </div>
                        </button>

                        {/* Add Cafe Button (Shortcut Sidebar) */}
                        <button onClick={() => setIsAddModalOpen(true)} className="w-full flex items-center gap-3 p-2 rounded hover:bg-[#1a1a1a] transition group cursor-pointer text-left mt-2">
                            <div className="w-12 h-12 bg-[#282828] rounded-sm flex items-center justify-center group-hover:bg-[#3E3E3E]">
                                <i className="fas fa-plus text-[#b3b3b3] group-hover:text-white"></i>
                            </div>
                            <div>
                                <p className="font-bold text-white">Tambah Kafe</p>
                                <p className="text-xs text-[#b3b3b3]">Buat data baru</p>
                            </div>
                        </button>
                    </div>
                </div>
            </aside>


            {/* =======================
          2. MAIN CONTENT (Kanan) 
         ======================= */}
            <main className="flex-1 bg-[#121212] my-2 mr-2 rounded-lg overflow-y-auto relative custom-scrollbar flex flex-col">

                {/* A. HEADER (Sticky) */}
                <header className="h-[64px] px-6 flex items-center justify-between sticky top-0 z-20 bg-[#121212]/95 backdrop-blur-sm">

                    {/* Left: Navigation & Search */}
                    <div className="flex items-center gap-4 flex-1">
                        {/* Nav Arrows */}
                        <div className="flex gap-2">
                            <button className="w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center cursor-not-allowed opacity-60">
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            <button className="w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center cursor-not-allowed opacity-60">
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>

                        {/* Search Bar Panjang (Sesuai Request) */}
                        <div className="relative group w-full max-w-md ml-2 transition-all">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <i className="fas fa-search text-[#b3b3b3] group-focus-within:text-white"></i>
                            </div>
                            <input
                                type="text"
                                placeholder="Cari koleksimu..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-[#242424] text-sm text-white rounded-full pl-10 pr-4 py-3 w-full border-none outline-none focus:ring-2 focus:ring-white/20 hover:bg-[#2a2a2a] transition-colors placeholder-[#b3b3b3]"
                            />
                        </div>
                    </div>

                    {/* Right: Actions & Profile */}
                    <div className="flex items-center gap-4">
                        {/* Tombol Hijau Utama */}
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-white text-black text-sm font-bold px-4 py-2 rounded-full hover:scale-105 hover:bg-[#f2f2f2] transition transform"
                        >
                            Tambahkan Kafe
                        </button>

                        {/* Profile Icon */}
                        <button
                            onClick={() => navigate('/profile')}
                            className="w-8 h-8 rounded-full bg-[#2a2a2a] p-1 border border-transparent hover:scale-105 transition overflow-hidden"
                        >
                            <div className="w-full h-full bg-[#535353] rounded-full flex items-center justify-center text-white text-xs">
                                <i className="fas fa-user"></i>
                            </div>
                        </button>
                    </div>
                </header>

                {/* B. SCROLLABLE CONTENT */}
                <div className="flex-1 px-6 pb-8 pt-2">

                    {/* Filter Dropdown Section */}
                    <div className="flex gap-2 mb-6 sticky top-[64px] z-10 bg-[#121212] py-2">
                        <div className="relative group">
                            <button className="flex items-center gap-2 bg-[#2a2a2a] text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-[#3E3E3E] transition-all">
                                <i className="fas fa-filter text-[#b3b3b3]"></i>
                                <span>{activeFilter === 'Semua' ? 'Filter Tags' : activeFilter}</span>
                                <i className="fas fa-chevron-down text-xs ml-1"></i>
                            </button>

                            {/* Dropdown Menu */}
                            <div className="absolute top-full left-0 pt-2 w-48 hidden group-hover:block z-50">
                                <div className="bg-[#282828] rounded-lg shadow-xl overflow-hidden border border-[#3E3E3E]">
                                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                        {filters.map((filter) => (
                                            <button
                                                key={filter}
                                                onClick={() => setActiveFilter(filter)}
                                                className={`w-full text-left px-4 py-3 text-sm font-bold hover:bg-[#3E3E3E] transition-colors ${activeFilter === filter ? 'text-[#1DB954]' : 'text-white'}`}
                                            >
                                                {filter}
                                                {activeFilter === filter && <i className="fas fa-check float-right text-[#1DB954]"></i>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reset Filter Button (Only show if filter is active) */}
                        {activeFilter !== 'Semua' && (
                            <button
                                onClick={() => setActiveFilter('Semua')}
                                className="bg-[#2a2a2a] text-[#b3b3b3] px-3 py-2 rounded-full text-xs font-bold hover:text-white hover:bg-[#3E3E3E] transition-all"
                            >
                                <i className="fas fa-times"></i> Clear
                            </button>
                        )}
                    </div>

                    {/* Section Title */}
                    <div className="mb-6 flex justify-between items-end">
                        <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">
                            Koleksi Terbaru
                        </h2>
                        <span className="text-xs font-bold text-[#b3b3b3] hover:underline cursor-pointer uppercase tracking-wider">
                            Tampilkan Semua
                        </span>
                    </div>

                    {/* GRID CARD KAFE */}
                    {loading ? (
                        <div className="h-40 flex items-center justify-center text-[#b3b3b3]">
                            <div className="w-8 h-8 border-4 border-[#1DB954] border-t-transparent rounded-full animate-spin mr-3"></div>
                            Memuat data...
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                            {cafes.map((cafe) => (
                                <CafeCard
                                    key={cafe.ID}
                                    cafe={cafe}
                                    onClick={(cafe, action) => {
                                        if (action === 'edit') {
                                            setCafeToEdit(cafe);
                                            setIsAddModalOpen(true);
                                        } else if (action === 'delete') {
                                            if (window.confirm(`Apakah Anda yakin ingin menghapus kafe "${cafe.name}"?`)) {
                                                const token = localStorage.getItem('token');
                                                axios.delete(`http://localhost:8080/protected/cafes/${cafe.ID}`, {
                                                    headers: { Authorization: token }
                                                })
                                                    .then(() => {
                                                        alert('Kafe berhasil dihapus');
                                                        window.location.reload();
                                                    })
                                                    .catch((err) => {
                                                        console.error(err);
                                                        alert('Gagal menghapus kafe (Mungkin bukan milik Anda)');
                                                    });
                                            }
                                        } else {
                                            setSelectedCafe(cafe);
                                        }
                                    }}
                                />
                            ))}

                            {/* State Kosong */}
                            {cafes.length === 0 && (
                                <div className="col-span-full py-12 text-center text-[#b3b3b3]">
                                    Belum ada kafe. Coba tambahkan sekarang!
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* MODALS */}
            {selectedCafe && (
                <DetailModal cafe={selectedCafe} onClose={() => setSelectedCafe(null)} />
            )}

            {isAddModalOpen && (
                <AddCafeModal
                    onClose={() => {
                        setIsAddModalOpen(false);
                        setCafeToEdit(null); // Reset edit state
                    }}
                    onSuccess={() => window.location.reload()}
                    initialData={cafeToEdit} // Pass data if editing
                />
            )}

        </div>
    );
}

export default Dashboard;

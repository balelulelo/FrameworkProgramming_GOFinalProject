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
    const [activeFilter, setActiveFilter] = useState('All Tags'); // State for active tag filter
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
                if (activeFilter !== 'All Tags') queryParams.push(`tag=${encodeURIComponent(activeFilter)}`);
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

    // Combine 'All Tags' with fetched tags
    const filters = ['All Tags', ...tags.map(t => t.name)];

    return (
        <div className="flex h-screen bg-black overflow-hidden font-sans text-white">


            {/* =======================
          2. MAIN CONTENT
         ======================= */}
            <main className="flex-1 bg-[#121212] my-2 mr-2 rounded-lg overflow-y-auto relative custom-scrollbar flex flex-col">

               {/* A. HEADER (Sticky) */}
                <header className="h-[72px] px-8 flex items-center justify-between sticky top-0 z-20 bg-[#121212]/95 backdrop-blur-sm border-b border-[#2a2a2a]">
                    
                    {/* Left: Brand & Search */}
                    <div className="flex items-center gap-6 flex-1">
                        
                        {/* 1. LOGO CAFETIFY */}
                        <div className="flex items-center gap-2 text-[#1DB954] min-w-fit cursor-pointer" onClick={() => window.location.reload()}>
                            <i className="fas fa-coffee text-2xl"></i>
                            <span className="font-bold text-xl tracking-tight text-white">Cafetify</span>
                        </div>

                        {/* 2. Search Bar */}
                        <div className="relative group w-full max-w-md ml-4 transition-all">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <i className="fas fa-search text-[#b3b3b3] group-focus-within:text-white"></i>
                            </div>
                            <input
                                type="text"
                                placeholder="Find Cafe..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-[#242424] text-sm text-white rounded-full pl-10 pr-4 py-3 w-full border-none outline-none focus:ring-2 focus:ring-white/20 hover:bg-[#2a2a2a] transition-colors placeholder-[#b3b3b3]"
                            />
                        </div>
                    </div>

                    {/* Right: Actions & Profile */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-white text-black text-sm font-bold px-6 py-3 rounded-full hover:scale-105 hover:bg-[#f2f2f2] transition transform"
                        >
                            Add New Cafe
                        </button>

                        <button
                            onClick={() => navigate('/profile')}
                            className="w-10 h-10 rounded-full bg-[#2a2a2a] p-1 border border-transparent hover:scale-105 transition overflow-hidden"
                            title="Profil Saya"
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
                                <span>{activeFilter === 'All Tags' ? 'Filter Tags' : activeFilter}</span>
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
                        {activeFilter !== 'All Tags' && (
                            <button
                                onClick={() => setActiveFilter('All Tags')}
                                className="bg-[#2a2a2a] text-[#b3b3b3] px-3 py-2 rounded-full text-xs font-bold hover:text-white hover:bg-[#3E3E3E] transition-all"
                            >
                                <i className="fas fa-times"></i> Clear
                            </button>
                        )}
                    </div>

                    {/* Section Title */}
                    <div className="mb-6 flex justify-between items-end">
                        <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">
                            All Cafes
                        </h2>
                    </div>

                    {/* GRID CARD KAFE */}
                    {loading ? (
                        <div className="h-40 flex items-center justify-center text-[#b3b3b3]">
                            <div className="w-8 h-8 border-4 border-[#1DB954] border-t-transparent rounded-full animate-spin mr-3"></div>
                            Loading data...
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
                                            if (window.confirm(`Are you sure you want to delete this cafe? "${cafe.name}"?`)) {
                                                const token = localStorage.getItem('token');
                                                axios.delete(`http://localhost:8080/protected/cafes/${cafe.ID}`, {
                                                    headers: { Authorization: token }
                                                })
                                                    .then(() => {
                                                        alert('Successfully deleted cafe.');
                                                        window.location.reload();
                                                    })
                                                    .catch((err) => {
                                                        console.error(err);
                                                        alert('Failed to delete cafe.');
                                                    });
                                            }
                                        } else {
                                            setSelectedCafe(cafe);
                                        }
                                    }}
                                />
                            ))}

                            {/* Empty State */}
                            {cafes.length === 0 && (
                                <div className="col-span-full py-12 text-center text-[#b3b3b3]">
                                    No cafe found. Add new cafe now!
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
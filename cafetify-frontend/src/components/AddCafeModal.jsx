import React, { useState } from 'react';
import axios from 'axios';

const AddCafeModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '', 
        address: '', 
        ambience_rating: 3, 
        service_rating: 3,
        price_level: 'Sedang', 
        menu_variety: 'Standar', // Default value yang aman
        notes: '', 
        tags_input: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('token'); // Ambil token

        try {
            // Pastikan data dikirim sebagai tipe yang benar (integer)
            const payload = {
                ...formData,
                ambience_rating: parseInt(formData.ambience_rating),
                service_rating: parseInt(formData.service_rating)
            };

            // URL sesuai endpoint Go yang menggunakan Group "/protected"
            await axios.post('http://localhost:8080/protected/cafe', payload, {
                headers: { Authorization: token } // Kirim token di header
            });
            
            alert('Berhasil menambahkan kafe baru!');
            onSuccess(); // Refresh dashboard
            onClose();
        } catch (err) {
            console.error("Error Detail:", err.response); // Cek console F12 jika gagal
            setError(err.response?.data?.error || 'Gagal menambahkan kafe. Cek koneksi atau login ulang.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-[#181818] text-white rounded-xl w-full max-w-lg border border-[#333] shadow-2xl flex flex-col max-h-[90vh]">
                
                {/* Header Modal */}
                <div className="p-6 border-b border-[#333] flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[#1DB954]">Tambah Kafe Baru</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>

                {/* Body Form (Scrollable) */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="bg-red-900/50 text-red-200 p-3 rounded mb-4 text-sm border border-red-800">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Nama & Alamat */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Info Dasar</label>
                            <input name="name" placeholder="Nama Kafe" onChange={handleChange} className="w-full bg-[#2a2a2a] border border-transparent focus:border-[#1DB954] text-white p-3 rounded mb-3 outline-none transition" required />
                            <input name="address" placeholder="Alamat Lengkap" onChange={handleChange} className="w-full bg-[#2a2a2a] border border-transparent focus:border-[#1DB954] text-white p-3 rounded outline-none transition" required />
                        </div>

                        {/* Rating Section */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Rating Awal</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#2a2a2a] p-3 rounded">
                                    <label className="text-sm text-gray-300 block mb-1">Ambience (1-5)</label>
                                    <input type="number" name="ambience_rating" min="1" max="5" value={formData.ambience_rating} onChange={handleChange} className="w-full bg-[#181818] p-2 rounded text-[#1DB954] font-bold text-center" />
                                </div>
                                <div className="bg-[#2a2a2a] p-3 rounded">
                                    <label className="text-sm text-gray-300 block mb-1">Service (1-5)</label>
                                    <input type="number" name="service_rating" min="1" max="5" value={formData.service_rating} onChange={handleChange} className="w-full bg-[#181818] p-2 rounded text-[#1DB954] font-bold text-center" />
                                </div>
                            </div>
                        </div>

                        {/* Dropdowns */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Harga</label>
                                <select name="price_level" onChange={handleChange} className="w-full bg-[#2a2a2a] p-3 rounded text-white outline-none">
                                    <option value="Murah">Rp Murah</option>
                                    <option value="Sedang">Rp Sedang</option>
                                    <option value="Mahal">Rp Mahal</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Variasi Menu</label>
                                <select name="menu_variety" onChange={handleChange} className="w-full bg-[#2a2a2a] p-3 rounded text-white outline-none">
                                    <option value="Standar">Standar</option>
                                    <option value="Lengkap">Lengkap</option>
                                    <option value="Sedikit">Sedikit</option>
                                </select>
                            </div>
                        </div>

                        {/* Notes & Tags */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Detail Tambahan</label>
                            <textarea name="notes" placeholder="Catatan: WiFi kencang, colokan banyak..." onChange={handleChange} className="w-full bg-[#2a2a2a] text-white p-3 rounded mb-3 h-20 outline-none focus:border-[#1DB954] border border-transparent" />
                            <input name="tags_input" placeholder="Tags: WiFi, Cozy, Outdoor (Pisahkan koma)" onChange={handleChange} className="w-full bg-[#2a2a2a] text-white p-3 rounded outline-none focus:border-[#1DB954] border border-transparent" />
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={onClose} className="px-6 py-3 rounded-full font-bold text-gray-400 hover:text-white transition uppercase text-sm tracking-widest">
                                Batal
                            </button>
                            <button type="submit" disabled={loading} className="bg-[#1DB954] hover:bg-green-400 text-black px-8 py-3 rounded-full font-bold transition transform hover:scale-105 uppercase text-sm tracking-widest disabled:opacity-50">
                                {loading ? 'Menyimpan...' : 'Simpan Kafe'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddCafeModal;
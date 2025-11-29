import React, { useState } from 'react';
import axios from 'axios';

const AddCafeModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '', address: '', ambience_rating: 3, service_rating: 3,
        price_level: 'Sedang', menu_variety: 'Standar', notes: '', tags_input: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            // Konversi rating ke integer
            const payload = {
                ...formData,
                ambience_rating: parseInt(formData.ambience_rating),
                service_rating: parseInt(formData.service_rating)
            };

            // PERBAIKAN URL: Gunakan jamak "cafes"
            await axios.post('http://localhost:8080/protected/cafes', payload, {
                headers: { Authorization: token }
            });
            
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            alert('Gagal menambahkan kafe.');
        } finally {
            setLoading(false);
        }
    };

    // Style umum untuk input field agar seragam dan kontras
    const inputStyle = "w-full bg-[#333] hover:bg-[#3E3E3E] focus:bg-[#3E3E3E] text-white border border-transparent focus:border-[#555] focus:outline-none focus:ring-1 focus:ring-[#1DB954] rounded p-3 text-sm transition-all placeholder-gray-500";
    const labelStyle = "block text-xs font-bold text-white mb-2 tracking-wide";

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#282828] w-full max-w-xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="px-8 py-6 border-b border-[#181818] flex justify-between items-center bg-[#282828]">
                    <h2 className="text-2xl font-bold text-white">Tambah Kafe</h2>
                    <button onClick={onClose} className="text-[#B3B3B3] hover:text-white transition">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar space-y-6 bg-[#282828]">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                            <label className={labelStyle}>Nama Kafe</label>
                            <input name="name" placeholder="Contoh: Kopi Kenangan" onChange={handleChange} className={inputStyle} required />
                        </div>
                        
                        <div className="col-span-1 md:col-span-2">
                            <label className={labelStyle}>Alamat / Lokasi</label>
                            <input name="address" placeholder="Jalan Raya No. 123" onChange={handleChange} className={inputStyle} required />
                        </div>
                    </div>

                    {/* Rating Section (Grid Box) */}
                    <div className="bg-[#181818] p-4 rounded-lg border border-[#333]">
                        <p className="text-white text-sm font-bold mb-4 border-b border-[#333] pb-2">Penilaian Awal</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-[#B3B3B3] mb-1 block">Ambience (1-5)</label>
                                <input type="number" name="ambience_rating" min="1" max="5" value={formData.ambience_rating} onChange={handleChange} className={inputStyle} />
                            </div>
                            <div>
                                <label className="text-xs text-[#B3B3B3] mb-1 block">Service (1-5)</label>
                                <input type="number" name="service_rating" min="1" max="5" value={formData.service_rating} onChange={handleChange} className={inputStyle} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className={labelStyle}>Range Harga</label>
                            <select name="price_level" onChange={handleChange} className={inputStyle}>
                                <option value="Murah">Murah</option>
                                <option value="Sedang">Sedang</option>
                                <option value="Mahal">Mahal</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelStyle}>Variasi Menu</label>
                            <select name="menu_variety" onChange={handleChange} className={inputStyle}>
                                <option value="Standar">Standar</option>
                                <option value="Lengkap">Lengkap</option>
                                <option value="Sedikit">Sedikit</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={labelStyle}>Catatan (Notes)</label>
                        <textarea name="notes" placeholder="Wifi kencang, cocok buat nugas..." onChange={handleChange} className={`${inputStyle} h-24 resize-none`} />
                    </div>

                    <div>
                        <label className={labelStyle}>Tags</label>
                        <input name="tags_input" placeholder="Cozy, Outdoor, 24Jam (pisahkan koma)" onChange={handleChange} className={inputStyle} />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="text-white font-bold hover:scale-105 transition px-4 py-3">
                            Batal
                        </button>
                        <button type="submit" disabled={loading} className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold rounded-full px-8 py-3 transition transform hover:scale-105 shadow-lg">
                            {loading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCafeModal;
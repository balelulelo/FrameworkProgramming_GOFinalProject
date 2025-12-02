import React, { useState } from 'react';
import axios from 'axios';

const AddCafeModal = ({ onClose, onSuccess, initialData = null }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        address: initialData?.address || '',
        ambience_rating: initialData?.ratings?.[0]?.ambience_rating || 3,
        service_rating: initialData?.ratings?.[0]?.service_rating || 3,
        price_level: initialData?.ratings?.[0]?.price_level || 'Mid-Range',
        menu_variety: initialData?.ratings?.[0]?.menu_variety || 'Standard',
        notes: initialData?.ratings?.[0]?.notes || '',
        tags_input: initialData?.tags?.map(t => t.name).join(', ') || ''
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

            if (initialData) {
                // EDIT MODE
                await axios.put(`http://localhost:8080/protected/cafes/${initialData.ID}`, payload, {
                    headers: { Authorization: token }
                });
            } else {
                // ADD MODE
                await axios.post('http://localhost:8080/protected/cafes', payload, {
                    headers: { Authorization: token }
                });
            }

            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            alert(initialData ? 'Gagal mengedit kafe.' : 'Gagal menambahkan kafe.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full bg-[#333] hover:bg-[#3E3E3E] focus:bg-[#3E3E3E] text-white border border-transparent focus:border-[#555] focus:outline-none focus:ring-1 focus:ring-[#1DB954] rounded p-3 text-sm transition-all placeholder-gray-500";
    const labelStyle = "block text-xs font-bold text-white mb-2 tracking-wide";

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#282828] w-full max-w-xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-8 py-6 border-b border-[#181818] flex justify-between items-center bg-[#282828]">
                    <h2 className="text-2xl font-bold text-white">{initialData ? 'Edit Cafe' : 'Add Cafe'}</h2>
                    <button onClick={onClose} className="text-[#B3B3B3] hover:text-white transition">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar space-y-6 bg-[#282828]">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                            <label className={labelStyle}>Cafe Name</label>
                            <input name="name" value={formData.name} placeholder="Ex: Charlie's Coffee" onChange={handleChange} className={inputStyle} required />
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className={labelStyle}>Address / Location</label>
                            <input name="address" value={formData.address} placeholder="123 Street" onChange={handleChange} className={inputStyle} required />
                        </div>
                    </div>

                    {/* Rating Section (Grid Box) - Only show for new cafes or if we want to allow editing initial rating (optional, but let's keep it for simplicity) */}
                    <div className="bg-[#181818] p-4 rounded-lg border border-[#333]">
                        <p className="text-white text-sm font-bold mb-4 border-b border-[#333] pb-2">Cafe Details</p>
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
                            <label className={labelStyle}>Price Range</label>
                            <select name="price_level" value={formData.price_level} onChange={handleChange} className={inputStyle}>
                                <option value="Affordable">Affordable</option>
                                <option value="Mid-Range">Mid-Range</option>
                                <option value="Expensive">Expensive</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelStyle}>Menu Variations</label>
                            <select name="menu_variety" value={formData.menu_variety} onChange={handleChange} className={inputStyle}>
                                <option value="Standard">Standard</option>
                                <option value="Diverse">Diverse</option>
                                <option value="Limited">Limited</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={labelStyle}>Notes</label>
                        <textarea name="notes" value={formData.notes} placeholder="Fast Wifi, Suitable for Working from Cafe..." onChange={handleChange} className={`${inputStyle} h-24 resize-none`} />
                    </div>

                    <div>
                        <label className={labelStyle}>Tags</label>
                        <input name="tags_input" value={formData.tags_input} placeholder="Cozy, Outdoor, 24Hours (separate with comma)" onChange={handleChange} className={inputStyle} />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="text-white font-bold hover:scale-105 transition px-4 py-3">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold rounded-full px-8 py-3 transition transform hover:scale-105 shadow-lg">
                            {loading ? 'Saving...' : 'Add Cafe'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCafeModal;

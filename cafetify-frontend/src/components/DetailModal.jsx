import React, { useState } from 'react';
import axios from 'axios';

const DetailModal = ({ cafe, onClose }) => {
    const tags = cafe.tags || [];

    // Helper Function: Format date time
    const formatDateTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(date);
    };
    
    // Default state for new rating form
    const [showRateForm, setShowRateForm] = useState(false);
    const [formData, setFormData] = useState({
        ambience_rating: 5,
        service_rating: 5,
        price_level: "Mid-Range",
        menu_variety: "Diverse",
        notes: "",
        tags_input: "" // Optional
    });

    const handleSubmitRating = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.post(`http://localhost:8080/protected/cafes/${cafe.ID}/rate`, formData, {
                headers: { Authorization: token }
            });
            alert("Rating berhasil dikirim!");
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Gagal mengirim rating.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-[#121212] w-full max-w-2xl rounded-xl shadow-2xl border border-gray-800 p-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={(e) => e.stopPropagation()}>
                
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">&times;</button>
                
                <h2 className="text-3xl font-bold text-[#1DB954] mb-1">{cafe.name}</h2>
                <p className="text-gray-400 text-sm mb-1"><i className="fas fa-map-marker-alt mr-2"></i>{cafe.address}</p>
                {/* <p className="text-xs text-gray-500 mb-6">Added by: {cafe.user?.username || 'Unknown'}</p> */}

                <div className="text-xs text-gray-500 mb-6 flex gap-2">
                    <span>Added by: <span className="text-white">{cafe.user?.username || 'Unknown'}</span></span>
                    <span>•</span>
                    <span>{formatDateTime(cafe.CreatedAt)}</span>
                </div>

                {/* --- LIST RATING --- */}
                <div className="bg-[#181818] p-4 rounded-lg mb-6">
                    <div className="flex justify-between items-center mb-3 border-b border-gray-700 pb-2">
                        <h3 className="text-white font-bold">Visitor Rating</h3>
                        
                        {/* open rating */}
                        {!showRateForm && (
                            <button 
                                onClick={() => setShowRateForm(true)}
                                className="text-xs bg-white text-black px-3 py-1 rounded-full font-bold hover:bg-gray-200"
                            >
                                + Give Rating
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 text-sm max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {cafe.ratings && cafe.ratings.length > 0 ? (
                             cafe.ratings.map((rating, idx) => (
                                <div key={idx} className="mb-2 border-b border-gray-800 pb-2 last:border-0">
                                    <div className="flex justify-between text-gray-300">
                                        <span>Ambience: <span className="text-yellow-400">★ {rating.ambience_rating}</span></span>
                                        <span>Service: <span className="text-yellow-400">★ {rating.service_rating}</span></span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Price: {rating.price_level} • Menu: {rating.menu_variety}</p>
                                    <p className="text-white mt-1 italic">"{rating.notes}"</p>
                                </div>
                             ))
                        ) : (
                            <p className="text-gray-500 italic">No ratings yet.</p>
                        )}
                    </div>
                </div>

                {/* --- new rating form if clicked --- */}
                {showRateForm && (
                    <form onSubmit={handleSubmitRating} className="bg-[#2a2a2a] p-4 rounded-lg mb-6 border border-[#3E3E3E] animate-fade-in">
                        <h4 className="text-white font-bold mb-4 text-sm">Write new rating</h4>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Ambience (1-5)</label>
                                <input type="number" min="1" max="5" required 
                                    className="w-full bg-[#121212] text-white rounded p-2 text-sm focus:ring-1 focus:ring-[#1DB954] outline-none"
                                    value={formData.ambience_rating}
                                    onChange={e => setFormData({...formData, ambience_rating: parseInt(e.target.value)})}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Service (1-5)</label>
                                <input type="number" min="1" max="5" required
                                    className="w-full bg-[#121212] text-white rounded p-2 text-sm focus:ring-1 focus:ring-[#1DB954] outline-none"
                                    value={formData.service_rating}
                                    onChange={e => setFormData({...formData, service_rating: parseInt(e.target.value)})}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Price</label>
                                <select className="w-full bg-[#121212] text-white rounded p-2 text-sm outline-none"
                                    value={formData.price_level}
                                    onChange={e => setFormData({...formData, price_level: e.target.value})}
                                >
                                    <option value="Affordable">Affordable</option>
                                    <option value="Mid-Range">Mid-Range</option>
                                    <option value="Expensive">Expensive</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Menu</label>
                                <select className="w-full bg-[#121212] text-white rounded p-2 text-sm outline-none"
                                    value={formData.menu_variety}
                                    onChange={e => setFormData({...formData, menu_variety: e.target.value})}
                                >
                                    <option value="Minim">Minim</option>
                                    <option value="Lengkap">Lengkap</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="text-xs text-gray-400 block mb-1">Notes</label>
                            <textarea className="w-full bg-[#121212] text-white rounded p-2 text-sm h-20 outline-none resize-none"
                                placeholder="How's your experience?"
                                value={formData.notes}
                                onChange={e => setFormData({...formData, notes: e.target.value})}
                            ></textarea>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setShowRateForm(false)} className="text-gray-400 hover:text-white text-sm px-4 py-2">Cancel</button>
                            <button type="submit" className="bg-[#1DB954] text-black font-bold text-sm px-6 py-2 rounded-full hover:scale-105 transition">Post Review</button>
                        </div>
                    </form>
                )}

                <div>
                    <h4 className="text-gray-400 text-sm mb-2">Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag, idx) => (
                            <span key={idx} className="bg-green-900 text-green-300 px-3 py-1 rounded-full text-xs font-semibold">
                                #{tag.name}
                            </span>
                        ))}
                    </div>
                </div>
                
            </div>
        </div>
    );
};

export default DetailModal;
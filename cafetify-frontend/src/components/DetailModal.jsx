import React from 'react';

const DetailModal = ({ cafe, onClose }) => {
    // Ambil tags (asumsi backend kirim array of object tags)
    const tags = cafe.tags || [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-[#121212] w-full max-w-2xl rounded-xl shadow-2xl border border-gray-800 p-6 relative" onClick={(e) => e.stopPropagation()}>
                
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">&times;</button>
                
                <h2 className="text-3xl font-bold text-[#1DB954] mb-1">{cafe.name}</h2>
                <p className="text-gray-400 mb-6 text-sm"><i className="fas fa-map-marker-alt mr-2"></i>{cafe.address}</p>

                <div className="bg-[#181818] p-4 rounded-lg mb-6">
                    <h3 className="text-white font-bold mb-3 border-b border-gray-700 pb-2">Informasi & Rating</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        {/* Karena ratings di Go adalah Array, kita ambil rata-rata atau ambil rating terbaru */}
                        {cafe.ratings && cafe.ratings.length > 0 ? (
                             cafe.ratings.map((rating, idx) => (
                                <div key={idx} className="col-span-2 mb-2 border-b border-gray-800 pb-2 last:border-0">
                                    <div className="flex justify-between text-gray-300">
                                        <span>Ambience: <span className="text-yellow-400">★ {rating.ambience_rating}</span></span>
                                        <span>Service: <span className="text-yellow-400">★ {rating.service_rating}</span></span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Harga: {rating.price_level} • Menu: {rating.menu_variety}</p>
                                    <p className="text-white mt-1 italic">"{rating.notes}"</p>
                                </div>
                             ))
                        ) : (
                            <p className="text-gray-500">Belum ada rating.</p>
                        )}
                    </div>
                </div>

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
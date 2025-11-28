// src/components/CafeCard.jsx (Contoh)

import React from 'react';

// Terima properti cafe dari list kafe
const CafeCard = ({ cafe }) => {

    // Hitung rata-rata rating (Contoh: Rata-rata dari Ambience dan Service)
    const calculateAverageRating = (ratings) => {
        if (!ratings || ratings.length === 0) return 'Belum ada rating';

        const totalRating = ratings.reduce((sum, r) => sum + r.ambience_rating + r.service_rating, 0);
        const count = ratings.length * 2; // Karena ada 2 jenis rating (Ambience dan Service)

        return (totalRating / count).toFixed(1);
    };

    const avgRating = calculateAverageRating(cafe.ratings);

    return (
        <div className="bg-neutral-800 p-4 rounded-lg shadow-xl hover:bg-neutral-700 transition duration-300 w-full cursor-pointer">
            
            {/* 

[Image of a coffee cup icon]
 - Opsional, untuk placeholder visual kafe */}

            <div className="w-full h-32 bg-neutral-700 rounded-md mb-4 flex items-center justify-center">
                <span className="text-4xl text-green-400">☕</span>
            </div>
            
            <h3 className="text-lg font-bold text-white truncate">{cafe.name}</h3>
            
            {/* Deskripsi/Alamat Kafe */}
            <p className="text-sm text-neutral-400 mt-1 truncate">{cafe.address || "Alamat tidak tersedia"}</p>
            
            {/* Rating dan Tags */}
            <div className="flex justify-between items-center mt-3">
                <div className="flex items-center text-sm text-green-400">
                    <span className="mr-1">⭐</span>
                    <p className="font-semibold">{avgRating}</p>
                </div>
                
                <div className="flex flex-wrap gap-1">
                    {cafe.tags && cafe.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="text-xs bg-green-900/50 text-green-300 px-2 py-0.5 rounded-full">
                            #{tag.name}
                        </span>
                    ))}
                    {cafe.tags && cafe.tags.length > 2 && (
                        <span className="text-xs text-neutral-400">+{cafe.tags.length - 2} lagi</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CafeCard;
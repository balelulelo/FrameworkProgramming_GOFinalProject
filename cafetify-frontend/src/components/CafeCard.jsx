import React from 'react';

const CafeCard = ({ cafe, onClick }) => {
    // Ambil rating terbaru atau default
    const latestRating = cafe.ratings && cafe.ratings.length > 0
        ? cafe.ratings[cafe.ratings.length - 1]
        : null;

    const avgScore = latestRating
        ? ((latestRating.ambience_rating + latestRating.service_rating) / 2).toFixed(1)
        : 'N/A';

    return (
        <div
            onClick={() => onClick(cafe)}
            className="bg-[#181818] hover:bg-[#282828] p-4 rounded-md transition-all duration-300 ease-in-out group cursor-pointer flex flex-col h-full hover:shadow-lg"
        >
            {/* 1. IMAGE THUMBNAIL AREA */}
            <div className="relative w-full aspect-square mb-4 shadow-lg rounded-md overflow-hidden bg-[#333]">
                {/* Gambar Placeholder / Icon */}
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2a2a2a] to-[#121212] group-hover:scale-105 transition-transform duration-500">
                    <i className="fas fa-mug-hot text-5xl text-gray-600 group-hover:text-white transition-colors"></i>
                </div>

                {/* RATING BADGE (DI DALAM GAMBAR - POJOK KANAN ATAS) */}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1 shadow-md border border-white/5">
                    <i className="fas fa-star text-[#1DB954] text-[10px]"></i>
                    <span className="text-white text-xs font-bold">{avgScore}</span>
                </div>

                {/* PLAY BUTTON (Muncul saat Hover - Khas Spotify) */}
                <div className="absolute bottom-2 right-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-xl flex gap-2">
                    {/* EDIT BUTTON */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick(cafe, 'edit');
                        }}
                        className="w-10 h-10 bg-[#282828] rounded-full flex items-center justify-center text-white hover:scale-105 hover:bg-[#3E3E3E]"
                        title="Edit Kafe"
                    >
                        <i className="fas fa-pencil-alt text-sm"></i>
                    </button>

                    {/* DELETE BUTTON */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick(cafe, 'delete');
                        }}
                        className="w-10 h-10 bg-[#282828] rounded-full flex items-center justify-center text-red-500 hover:scale-105 hover:bg-[#3E3E3E]"
                        title="Hapus Kafe"
                    >
                        <i className="fas fa-trash text-sm"></i>
                    </button>

                    {/* PLAY/DETAIL BUTTON */}
                    <div className="w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center text-black hover:scale-105 hover:bg-[#1ed760]">
                        <i className="fas fa-play text-sm ml-1"></i>
                    </div>
                </div>
            </div>

            {/* 2. TEXT INFO */}
            <div className="flex flex-col gap-1 min-h-[60px]">
                <h3 className="text-white font-bold text-md truncate pr-2" title={cafe.name}>
                    {cafe.name}
                </h3>
                <p className="text-[#a7a7a7] text-sm line-clamp-2 leading-tight">
                    {cafe.address || "Alamat tidak tersedia"}
                </p>
            </div>

            {/* 3. TAGS (Di Bawah) */}
            <div className="mt-4 pt-2 flex flex-wrap gap-2">
                {cafe.tags && cafe.tags.slice(0, 2).map((tag, idx) => (
                    <span key={idx} className="text-[10px] uppercase font-bold text-white bg-white/10 px-2 py-1 rounded-sm">
                        {tag.name}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default CafeCard;

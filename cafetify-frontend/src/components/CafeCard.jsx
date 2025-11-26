import React from 'react';

const CafeCard = ({ cafe, onClick }) => {
  // Logika mengambil rating terbaru (sama seperti logika di HTML asli)
  // Backend Go mengirim "ratings" (array)
  const latestRating = cafe.ratings && cafe.ratings.length > 0 
    ? cafe.ratings[cafe.ratings.length - 1] 
    : null;

  const avgScore = latestRating 
    ? ((latestRating.ambience_rating + latestRating.service_rating) / 2).toFixed(1)
    : "N/A";

  return (
    <div 
      className="bg-[#181818] p-4 rounded-lg cafe-card cursor-pointer group relative"
      onClick={() => onClick(cafe)}
    >
      {/* Placeholder Image */}
      <div className="bg-[#333] h-40 w-full rounded-md mb-4 flex items-center justify-center shadow-lg group-hover:shadow-2xl transition">
        <i className="fas fa-coffee text-4xl text-gray-600 group-hover:text-[#1DB954] transition"></i>
      </div>
      
      <h3 className="font-bold text-white truncate text-lg mb-1">{cafe.name}</h3>
      <p className="text-gray-400 text-sm truncate mb-3">{cafe.address}</p>
      
      {/* Tags Rendering */}
      <div className="flex items-center gap-2 mb-3 overflow-hidden">
        {cafe.tags && cafe.tags.slice(0, 2).map((tag, idx) => (
          <span key={idx} className="text-[10px] uppercase tracking-wide bg-[#2a2a2a] text-gray-300 px-2 py-1 rounded">
            {tag.name}
          </span>
        ))}
        {cafe.tags && cafe.tags.length > 2 && (
           <span className="text-[10px] text-gray-500">+{cafe.tags.length - 2}</span>
        )}
      </div>

      {/* Score Badge */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-70 backdrop-blur-sm rounded-full px-3 py-1 flex items-center shadow-lg">
        <i className="fas fa-star text-[#1DB954] text-xs mr-1"></i>
        <span className="font-bold text-white text-sm">{avgScore}</span>
      </div>
    </div>
  );
};

export default CafeCard;
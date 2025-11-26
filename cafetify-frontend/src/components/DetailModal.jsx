import React from 'react';

const DetailModal = ({ cafe, onClose }) => {
  if (!cafe) return null;

  const latest = cafe.ratings && cafe.ratings.length > 0 
    ? cafe.ratings[cafe.ratings.length - 1] 
    : { ambience_rating: 0, service_rating: 0, menu_variety: '-', price_level: '-', notes: 'Belum ada rating' };

  const avg = ((latest.ambience_rating + latest.service_rating) / 2).toFixed(1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-[#181818] rounded-xl w-full max-w-2xl shadow-2xl border border-[#333] flex flex-col max-h-[90vh] overflow-hidden relative">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-b from-[#2a2a2a] to-[#181818] p-8 pb-4">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">
            <i className="fas fa-times"></i>
          </button>
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[#1DB954] text-xs font-bold tracking-wider uppercase mb-1">CAFE DETAILS</p>
              <h2 className="text-4xl font-bold text-white mb-2">{cafe.name}</h2>
              <p className="text-gray-400 text-sm"><i className="fas fa-map-marker-alt mr-2"></i>{cafe.address}</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-[#1DB954]">{avg}</div>
              <div className="text-xs text-gray-500 mt-1">OVERALL RATING</div>
            </div>
          </div>
        </div>

        {/* Body Modal */}
        <div className="p-8 pt-4 overflow-y-auto space-y-6">
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {cafe.tags && cafe.tags.map((tag, idx) => (
               <span key={idx} className="px-3 py-1 bg-[#1DB954] bg-opacity-20 text-white rounded-full text-xs font-bold border border-[#1DB954] border-opacity-30">
                 {tag.name}
               </span>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6 p-4 bg-[#222] rounded-lg border border-[#333]">
             {/* Ambience */}
             <div>
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Ambience</span>
                    <span className="text-white font-bold">{latest.ambience_rating}/5</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{width: `${(latest.ambience_rating/5)*100}%`}}></div>
                </div>
             </div>
             {/* Service */}
             <div>
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Service</span>
                    <span className="text-white font-bold">{latest.service_rating}/5</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: `${(latest.service_rating/5)*100}%`}}></div>
                </div>
             </div>
             <div>
                <div className="text-sm text-gray-300 mb-1">Menu Variety</div>
                <div className="text-white font-bold text-lg">{latest.menu_variety}</div>
            </div>
            <div>
                <div className="text-sm text-gray-300 mb-1">Price Level</div>
                <div className="text-[#1DB954] font-bold text-lg">{latest.price_level}</div>
            </div>
          </div>

          {/* Notes */}
          <div>
              <h3 className="text-white font-bold mb-2">Catatan Pribadi</h3>
              <p className="text-gray-300 text-sm leading-relaxed italic border-l-4 border-[#1DB954] pl-4 bg-[#222] py-3 pr-3 rounded-r-lg">
                  {latest.notes || "Tidak ada catatan."}
              </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
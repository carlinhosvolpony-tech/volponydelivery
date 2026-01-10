import React from 'react';
import { Star, Clock, MapPin, XCircle, Car, Bike } from 'lucide-react';
import { Restaurant } from '../types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: (restaurant: Restaurant) => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onClick }) => {
  // Logic to determine if open (supports 2 shifts)
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const checkInterval = (startStr?: string, endStr?: string) => {
    if (!startStr || !endStr) return false;
    
    const [openH, openM] = startStr.split(':').map(Number);
    const [closeH, closeM] = endStr.split(':').map(Number);
    
    const startMinutes = openH * 60 + openM;
    const endMinutes = closeH * 60 + closeM;

    // Handles midnight crossing (e.g. 18:00 to 02:00)
    if (endMinutes < startMinutes) {
       return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    } else {
       return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    }
  };

  const isOpenShift1 = checkInterval(restaurant.openingTime, restaurant.closingTime);
  const isOpenShift2 = checkInterval(restaurant.openingTime2, restaurant.closingTime2);
  
  const isOpen = isOpenShift1 || isOpenShift2;
  const isTaxi = restaurant.category === 'taxi';

  return (
    <div 
      onClick={() => onClick(restaurant)}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full group ${!isOpen ? 'opacity-75 grayscale-[0.5]' : ''}`}
    >
      <div className="relative h-40 overflow-hidden">
        <img 
          src={restaurant.image} 
          alt={restaurant.name} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        {restaurant.deliveryFee === 0 && restaurant.pricePerKm === 0 && isOpen && !isTaxi && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
            Entrega Grátis
          </div>
        )}
        {!isOpen && (
           <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
             <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                <XCircle size={16} /> Fechado
             </div>
           </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{restaurant.name}</h3>
          <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded text-sm text-yellow-600 font-semibold">
            <Star size={14} fill="currentColor" />
            {restaurant.rating}
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mb-2 capitalize flex items-center gap-1">
           {isTaxi ? <Car size={14}/> : null}
           {isTaxi && restaurant.vehicleModel ? `${restaurant.vehicleModel}` : restaurant.category}
        </p>
        
        <div className="flex justify-between items-end mt-auto text-xs text-gray-500">
           <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                {isTaxi ? 'Chega em: ' : ''}{restaurant.deliveryTime}
              </div>
              <div className="text-[10px] text-gray-400">
                 {restaurant.openingTime} - {restaurant.closingTime}
                 {restaurant.openingTime2 && ` / ${restaurant.openingTime2} - ${restaurant.closingTime2}`}
              </div>
           </div>
           <div className="flex items-center gap-1 text-gray-700 font-medium">
              {!isTaxi && <MapPin size={12} className="text-brand-500" />}
              {restaurant.deliveryFee === 0 && restaurant.pricePerKm === 0 ? (
                isTaxi ? 'Preço por Viagem' : 'Grátis'
              ) : (
                `A partir de R$ ${restaurant.deliveryFee.toFixed(2)}`
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
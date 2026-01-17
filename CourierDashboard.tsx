
import React, { useState, useEffect, useRef } from 'react';
import { Order, OrderStatus, Restaurant, User, Address } from '../types';
import { Clock, MapPin, Navigation, CheckCircle, Package, LogOut, Bike, Volume2, VolumeX, Store, ArrowRight, WifiOff, Cloud, RefreshCw, Car } from 'lucide-react';
import { db } from '../services/data';

interface CourierDashboardProps {
  orders: Order[];
  restaurants: Restaurant[];
  user: User;
  onUpdateStatus: (orderId: string, status: OrderStatus, courierId?: string, courierName?: string) => void;
  onLogout: () => void;
  onRefresh?: () => void;
}

const CourierDashboard: React.FC<CourierDashboardProps> = ({ 
  orders, 
  restaurants,
  user,
  onUpdateStatus, 
  onLogout,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'available' | 'active'>('available');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const previousReadyCount = useRef(0);
  const isOnline = db.getCloudStatus();
  
  const myRestaurants = restaurants.filter(r => user.courierRestaurantIds?.includes(r.id));
  const myRestaurantIds = myRestaurants.map(r => r.id);

  const availableOrders = orders.filter(o => {
    const isLinked = myRestaurantIds.includes(o.restaurantId);
    if (!isLinked) return false;
    if (o.courierId) return false;
    const restaurant = restaurants.find(r => r.id === o.restaurantId);
    const isTaxi = restaurant?.category === 'taxi';
    if (isTaxi) return o.status === 'pending';
    return o.status === 'ready' && o.orderType === 'delivery';
  });

  const activeDeliveries = orders.filter(o => 
    o.courierId === user.id &&
    (o.status === 'heading_to_pickup' || o.status === 'delivering')
  );

  useEffect(() => {
    if (availableOrders.length > previousReadyCount.current) {
      if (soundEnabled) {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); 
        audio.play().catch(e => console.log('Audio blocked', e));
      }
    }
    previousReadyCount.current = availableOrders.length;
  }, [availableOrders.length, soundEnabled]);

  const handleTakeOrder = (orderId: string, isTaxi: boolean) => {
    if (!user.id) return alert("Erro de identificação. Faça login novamente.");
    if(confirm(isTaxi ? "Aceitar esta corrida?" : "Aceitar esta entrega?")) {
      onUpdateStatus(orderId, 'heading_to_pickup', user.id, user.name);
      setActiveTab('active');
    }
  };

  const handleConfirmPickup = (orderId: string, isTaxi: boolean) => {
    if(confirm(isTaxi ? "Passageiro embarcou?" : "Retirou o pedido no balcão?")) {
      onUpdateStatus(orderId, 'delivering');
    }
  };

  const handleCompleteOrder = (orderId: string) => {
    if(confirm("Confirmar finalização?")) {
      onUpdateStatus(orderId, 'completed');
    }
  };

  const formatAddress = (addr: string | Address): string => {
    if (typeof addr === 'string') return addr;
    return `${addr.street}, ${addr.number} - ${addr.neighborhood}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-dark-900 text-white shadow-lg sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-brand-500 p-2 rounded-lg">
               <Bike size={24} className="text-white" />
            </div>
            <div>
               <h1 className="font-bold text-lg leading-none mb-1">Painel do Parceiro</h1>
               <div className="flex items-center gap-2">
                 <p className="text-xs text-brand-400">Olá, {user.name.split(' ')[0]}</p>
                 <span className="text-gray-600 text-xs">|</span>
                 {isOnline ? (
                    <p className="text-[10px] text-green-400 font-bold flex items-center gap-1 bg-green-900/30 px-2 py-0.5 rounded-full border border-green-800">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online
                    </p>
                 ) : (
                    <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1 bg-gray-800 px-2 py-0.5 rounded-full">
                        <WifiOff size={10} /> Local
                    </p>
                 )}
               </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             {onRefresh && (
               <button 
                 onClick={onRefresh}
                 className="p-2 bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600 rounded-full transition-colors"
                 title="Atualizar Dados"
               >
                 <RefreshCw size={20} />
               </button>
             )}
             <button 
               onClick={() => setSoundEnabled(!soundEnabled)}
               className={`p-2 rounded-full transition-colors ${soundEnabled ? 'bg-brand-600 text-white' : 'bg-gray-700 text-gray-400'}`}
               title={soundEnabled ? "Som Ativado" : "Som Desativado"}
             >
               {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
             </button>
             <button onClick={onLogout} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
               <LogOut size={20} />
             </button>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto flex">
          <button 
            onClick={() => setActiveTab('available')}
            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex justify-center items-center gap-2 ${activeTab === 'available' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500'}`}
          >
            <Package size={18} />
            Disponíveis ({availableOrders.length})
          </button>
          <button 
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex justify-center items-center gap-2 ${activeTab === 'active' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500'}`}
          >
            <Navigation size={18} />
            Em Rota ({activeDeliveries.length})
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="space-y-4">
          {activeTab === 'available' && (
            <>
              {availableOrders.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                   <Clock size={48} className="mx-auto mb-4 opacity-30 animate-pulse" />
                   <p>Aguardando novas solicitações...</p>
                </div>
              ) : (
                availableOrders.map(order => {
                  const restaurant = restaurants.find(r => r.id === order.restaurantId);
                  const isTaxi = restaurant?.category === 'taxi';

                  return (
                  <div key={order.id} className={`bg-white rounded-xl shadow-sm border-l-4 ${isTaxi ? 'border-l-blue-500' : 'border-l-green-500'} overflow-hidden animate-slideUp`}>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                         <div className="flex items-center gap-2">
                            <span className={`${isTaxi ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'} text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1`}>
                               <CheckCircle size={12} /> {isTaxi ? 'Corrida Solicitada' : 'Pronto para Coleta'}
                            </span>
                            <span className="text-xs text-gray-500">{new Date(order.timestamp).toLocaleTimeString()}</span>
                         </div>
                         <span className="font-bold text-gray-900">R$ {order.total.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex items-start gap-3 mb-4">
                         <div className="mt-1 bg-gray-100 p-2 rounded-lg">
                           {isTaxi ? <MapPin size={20} className="text-blue-600"/> : <Store size={20} className="text-gray-600" />}
                         </div>
                         <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">{isTaxi ? 'Buscar Passageiro em' : 'Retirar em'}</p>
                            <h3 className="font-bold text-gray-800">{formatAddress(order.customerAddress)}</h3>
                         </div>
                      </div>

                      {(!isTaxi || (isTaxi && order.items[0]?.description)) && (
                        <div className="flex items-start gap-3 mb-4">
                           <div className="mt-1 bg-brand-50 p-2 rounded-lg">
                             <Navigation size={20} className="text-brand-600" />
                           </div>
                           <div>
                              <p className="text-xs text-gray-500 uppercase font-bold">{isTaxi ? 'Levar Para' : 'Entregar para'}</p>
                              <h3 className="font-bold text-gray-800">{isTaxi ? (order.items[0]?.description || "Destino a informar") : order.customerName}</h3>
                              {!isTaxi && <p className="text-sm text-gray-600">{formatAddress(order.customerAddress)}</p>}
                           </div>
                        </div>
                      )}

                      <button 
                        onClick={() => handleTakeOrder(order.id, !!isTaxi)}
                        className={`w-full text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${isTaxi ? 'bg-blue-600 hover:bg-blue-700' : 'bg-brand-600 hover:bg-brand-700'}`}
                      >
                        {isTaxi ? <Car size={20} /> : <Bike size={20} />} {isTaxi ? 'Aceitar Corrida' : 'Aceitar Entrega'}
                      </button>
                    </div>
                  </div>
                )})
              )}
            </>
          )}

          {activeTab === 'active' && (
             <>
             {activeDeliveries.length === 0 ? (
               <div className="text-center py-20 text-gray-400">
                  <Navigation size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Você não tem entregas ativas.</p>
               </div>
             ) : (
               activeDeliveries.map(order => {
                 const isHeadingToPickup = order.status === 'heading_to_pickup';
                 const restaurant = restaurants.find(r => r.id === order.restaurantId);
                 const isTaxi = restaurant?.category === 'taxi';

                 return (
                 <div key={order.id} className="bg-white rounded-xl shadow-md border border-brand-200 overflow-hidden animate-fadeIn">
                   <div className={`${isHeadingToPickup ? 'bg-orange-500' : 'bg-brand-600'} p-3 flex justify-between items-center text-white transition-colors duration-300`}>
                      <span className="font-bold flex items-center gap-2">
                         {isHeadingToPickup ? <Store size={18} /> : (isTaxi ? <Car size={18}/> : <Bike size={18} />)}
                         {isHeadingToPickup 
                            ? (isTaxi ? 'Buscando Passageiro' : 'Indo para o Restaurante') 
                            : (isTaxi ? 'Em Corrida' : 'Levando ao Cliente')}
                      </span>
                      <span className="text-xs opacity-90">#{order.id.slice(-4)}</span>
                   </div>
                   <div className="p-5">
                      <div className="mb-6 relative pl-4 border-l-2 border-dashed border-gray-300 space-y-6">
                        <div className={`relative transition-opacity duration-300 ${!isHeadingToPickup ? 'opacity-50' : 'opacity-100'}`}>
                           <div className={`absolute -left-[23px] top-0 border-4 border-white w-4 h-4 rounded-full shadow-sm transition-colors duration-300 ${isHeadingToPickup ? 'bg-orange-500 scale-125' : 'bg-gray-400'}`}></div>
                           <p className="text-xs text-gray-500 uppercase">{isTaxi ? 'Embarque' : 'Coleta'}</p>
                           <p className="font-bold text-gray-800">{isTaxi ? formatAddress(order.customerAddress) : restaurant?.name}</p>
                        </div>
                        
                        <div className={`relative transition-opacity duration-300 ${isHeadingToPickup ? 'opacity-50' : 'opacity-100'}`}>
                           <div className={`absolute -left-[23px] top-0 border-4 border-white w-4 h-4 rounded-full shadow-sm transition-colors duration-300 ${!isHeadingToPickup ? 'bg-brand-600 scale-125' : 'bg-gray-400'}`}></div>
                           <p className="text-xs text-gray-500 uppercase">{isTaxi ? 'Desembarque' : 'Entrega'}</p>
                           <p className="font-bold text-gray-800 text-lg">{isTaxi ? (order.items[0]?.description || "Destino") : order.customerName}</p>
                           {!isTaxi && <p className="text-gray-600">{formatAddress(order.customerAddress)}</p>}
                           
                           {!isHeadingToPickup && (
                              <a 
                                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(formatAddress(isTaxi ? (order.items[0]?.description || '') : order.customerAddress))}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-brand-600 text-sm font-medium hover:underline mt-1 inline-block"
                              >
                                Abrir no GPS
                              </a>
                           )}
                        </div>
                      </div>

                      {isHeadingToPickup ? (
                         <button 
                           onClick={() => handleConfirmPickup(order.id, !!isTaxi)}
                           className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30"
                         >
                           <Package size={20} /> {isTaxi ? 'Passageiro Embarcou' : 'Confirmar Coleta'}
                         </button>
                      ) : (
                         <button 
                           onClick={() => handleCompleteOrder(order.id)}
                           className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg"
                         >
                           <CheckCircle size={20} /> {isTaxi ? 'Corrida Finalizada' : 'Finalizar Entrega'}
                         </button>
                      )}
                   </div>
                 </div>
               )})
             )}
           </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourierDashboard;


import React from 'react';
import { Order, OrderStatus, Restaurant, User } from '../types';
import { Clock, CheckCircle, Truck, XCircle, ShoppingBag, Bike, User as UserIcon, LogOut, Store, Settings, ArrowRight, WifiOff, Cloud, RefreshCw } from 'lucide-react';
import { db } from '../services/data';

interface RestaurantDashboardProps {
  orders: Order[];
  restaurant: Restaurant;
  user: User;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onEditRestaurant: () => void;
  onLogout: () => void;
  onRefresh?: () => void;
}

const RestaurantDashboard: React.FC<RestaurantDashboardProps> = ({ 
  orders, 
  restaurant, 
  user,
  onUpdateStatus, 
  onEditRestaurant,
  onLogout,
  onRefresh
}) => {
  // Filtra pedidos para este restaurante
  const myOrders = orders.filter(o => o.restaurantId === restaurant.id).sort((a, b) => b.timestamp - a.timestamp);
  const isOnline = db.getCloudStatus();

  // Lógica de horários (multi-turno)
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const checkInterval = (startStr?: string, endStr?: string) => {
    if (!startStr || !endStr) return false;
    const [openH, openM] = startStr.split(':').map(Number);
    const [closeH, closeM] = endStr.split(':').map(Number);
    const startMinutes = openH * 60 + openM;
    const endMinutes = closeH * 60 + closeM;
    
    if (endMinutes < startMinutes) {
       return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    } else {
       return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    }
  };

  const isOpen = checkInterval(restaurant.openingTime, restaurant.closingTime) || 
                 checkInterval(restaurant.openingTime2, restaurant.closingTime2);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'heading_to_pickup': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'delivering': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Pronto';
      case 'heading_to_pickup': return 'Entregador a Caminho';
      case 'delivering': return 'Saiu p/ Entrega';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <img src={restaurant.image} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
             <div>
               <h1 className="text-xl font-bold text-gray-800">{restaurant.name}</h1>
               <div className="flex items-center gap-2">
                 {isOpen ? (
                    <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Aberto
                    </p>
                 ) : (
                    <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        Fechado
                    </p>
                 )}
                 <span className="text-gray-300 text-xs">|</span>
                 {isOnline ? (
                    <p className="text-xs text-brand-600 font-bold flex items-center gap-1" title="Sincronizado com a nuvem">
                        <Cloud size={10} /> Online
                    </p>
                 ) : (
                    <p className="text-xs text-gray-400 font-medium flex items-center gap-1" title="Modo Local (Offline)">
                        <WifiOff size={10} /> Local
                    </p>
                 )}
               </div>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
               <p className="text-sm font-medium text-gray-800">{user.name}</p>
               <p className="text-xs text-gray-500">Gestor</p>
             </div>
             
             {onRefresh && (
               <button
                 onClick={onRefresh}
                 className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg transition-colors"
                 title="Atualizar Pedidos Manualmente"
               >
                 <RefreshCw size={20} />
               </button>
             )}

             <button
               onClick={onEditRestaurant}
               className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
               title="Editar Cardápio e Loja"
             >
               <Settings size={18} />
               <span className="hidden sm:inline">Gerenciar Loja</span>
             </button>

             <div className="h-6 w-px bg-gray-300 mx-1"></div>

             <button 
               onClick={onLogout}
               className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
               title="Sair"
             >
               <LogOut size={20} />
             </button>
          </div>
        </div>
      </header>

      {/* Kanban / Order List */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          
          {myOrders.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-400">
               <ShoppingBag size={64} className="mx-auto mb-4 opacity-30" />
               <p className="text-lg">Nenhum pedido recebido ainda.</p>
               <p className="text-sm">Os novos pedidos enviados pelo cliente via WhatsApp aparecerão aqui.</p>
            </div>
          )}

          {myOrders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              
              {/* Card Header */}
              <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                 <div>
                   <span className="font-mono text-xs text-gray-400">#{order.id.slice(-6)}</span>
                   <h3 className="font-bold text-gray-800 mt-1">{order.customerName}</h3>
                   <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                     {order.orderType === 'delivery' ? <Bike size={12} /> : <ShoppingBag size={12} />}
                     {order.orderType === 'delivery' ? 'Entrega' : 'Retirada'}
                   </div>
                 </div>
                 <div className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(order.status)}`}>
                   {getStatusLabel(order.status)}
                 </div>
              </div>

              {/* Items */}
              <div className="p-4 flex-1 bg-gray-50/50">
                 <ul className="space-y-2">
                   {order.items.map((item, idx) => (
                     <li key={idx} className="text-sm text-gray-700 flex justify-between">
                       <span><span className="font-bold text-gray-900">{item.quantity}x</span> {item.name}</span>
                     </li>
                   ))}
                 </ul>
                 {order.orderType === 'delivery' && (
                   <div className="mt-4 text-xs text-gray-500 border-t border-gray-200 pt-2">
                     <p className="font-semibold mb-1">Endereço:</p>
                     <p>{typeof order.customerAddress === 'string' ? order.customerAddress : `${order.customerAddress.street}, ${order.customerAddress.number}`}</p>
                   </div>
                 )}
                 <div className="mt-2 text-xs text-gray-500">
                   Pagamento: <span className="font-medium">{order.paymentMethod}</span>
                 </div>
                 
                 {(order.status === 'delivering' || order.status === 'heading_to_pickup') && order.courierName && (
                    <div className={`mt-2 text-xs px-2 py-1 rounded border flex items-center gap-1 ${order.status === 'heading_to_pickup' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
                        <Bike size={14} />
                        <b>Entregador:</b> {order.courierName}
                        {order.status === 'heading_to_pickup' && ' (Vindo buscar)'}
                    </div>
                 )}
              </div>

              {/* Footer / Actions */}
              <div className="p-3 border-t border-gray-100 bg-white">
                 <div className="flex justify-between items-center mb-3">
                   <span className="text-xs text-gray-400">Total</span>
                   <span className="font-bold text-lg text-gray-900">R$ {order.total.toFixed(2)}</span>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-2">
                   {order.status === 'pending' && (
                     <button onClick={() => onUpdateStatus(order.id, 'preparing')} className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700">
                       Aceitar & Preparar
                     </button>
                   )}
                   {order.status === 'preparing' && (
                     <button onClick={() => onUpdateStatus(order.id, 'ready')} className="w-full py-2 bg-amber-500 text-white rounded-lg font-medium text-sm hover:bg-amber-600">
                       Marcar como Pronto
                     </button>
                   )}
                   {order.status === 'ready' && order.orderType === 'delivery' && (
                     <div className="w-full py-2 bg-gray-100 text-gray-500 rounded-lg font-medium text-sm text-center border border-gray-200">
                       Aguardando Entregador...
                     </div>
                   )}
                   {order.status === 'heading_to_pickup' && (
                     <div className="w-full py-2 bg-orange-100 text-orange-700 rounded-lg font-bold text-sm text-center border border-orange-200 flex items-center justify-center gap-2 shadow-sm">
                       <Clock size={16}/> Aguardando Coleta
                     </div>
                   )}
                   {order.status === 'ready' && order.orderType === 'pickup' && (
                     <button onClick={() => onUpdateStatus(order.id, 'completed')} className="w-full py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700">
                       Entregar ao Cliente
                     </button>
                   )}
                   {order.status === 'delivering' && (
                     <div className="w-full py-2 bg-purple-50 text-purple-600 rounded-lg font-medium text-sm text-center border border-purple-100">
                        Em Trânsito
                     </div>
                   )}
                   
                   {order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'delivering' && order.status !== 'heading_to_pickup' && (
                     <button onClick={() => { if(confirm('Cancelar pedido?')) onUpdateStatus(order.id, 'cancelled') }} className="w-full py-2 text-red-500 hover:bg-red-50 rounded-lg font-medium text-xs mt-1">
                       Cancelar Pedido
                     </button>
                   )}
                 </div>
              </div>

              {/* Timer */}
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
                 <span className="flex items-center gap-1">
                   <Clock size={12} /> {new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                 </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;

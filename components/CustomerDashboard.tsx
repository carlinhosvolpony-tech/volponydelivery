import React from 'react';
import { Order, OrderStatus, Restaurant, User } from '../types';
import { Package, Clock, CheckCircle, Bike, ShoppingBag, XCircle, ChefHat, MessageCircle, Store } from 'lucide-react';

interface CustomerDashboardProps {
  orders: Order[];
  restaurants: Restaurant[];
  user: User;
  onBackToHome: () => void;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ orders, restaurants, user, onBackToHome }) => {
  const myOrders = orders
    .filter(o => o.customerId === user.id)
    .sort((a, b) => b.timestamp - a.timestamp);

  const getStatusStep = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 1;
      case 'preparing': return 2;
      case 'ready': return 3;
      case 'heading_to_pickup': return 4;
      case 'delivering': return 5;
      case 'completed': return 6;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  const totalSteps = 6;

  const getStatusInfo = (status: OrderStatus, orderType: string) => {
     switch(status) {
       case 'pending': return { label: 'Aguardando', icon: <Clock />, color: 'text-yellow-600', bg: 'bg-yellow-100' };
       case 'preparing': return { label: 'Preparando', icon: <ChefHat />, color: 'text-blue-600', bg: 'bg-blue-100' };
       case 'ready': return { label: orderType === 'delivery' ? 'Aguardando Entregador' : 'Pronto p/ Retirada', icon: <Package />, color: 'text-orange-600', bg: 'bg-orange-100' };
       case 'heading_to_pickup': return { label: 'Entregador indo Buscar', icon: <Store />, color: 'text-orange-600', bg: 'bg-orange-100' };
       case 'delivering': return { label: 'Saiu p/ Entrega', icon: <Bike />, color: 'text-purple-600', bg: 'bg-purple-100' };
       case 'completed': return { label: 'Entregue', icon: <CheckCircle />, color: 'text-green-600', bg: 'bg-green-100' };
       case 'cancelled': return { label: 'Cancelado', icon: <XCircle size={18} />, color: 'text-red-600', bg: 'bg-red-100' };
       default: return { label: '...', icon: <Clock />, color: 'text-gray-600', bg: 'bg-gray-100' };
     }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
           <h2 className="text-2xl font-bold text-gray-800">Meus Pedidos</h2>
           <button onClick={onBackToHome} className="text-brand-600 font-medium hover:underline">Fazer novo pedido</button>
        </div>

        {myOrders.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
              <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Você ainda não fez nenhum pedido.</p>
           </div>
        ) : (
          myOrders.map(order => {
             const restaurant = restaurants.find(r => r.id === order.restaurantId);
             const step = getStatusStep(order.status);
             const info = getStatusInfo(order.status, order.orderType);
             
             return (
               <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                 <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <img src={restaurant?.image} className="w-10 h-10 rounded-full object-cover bg-gray-200" />
                       <div>
                          <h3 className="font-bold text-gray-800">{restaurant?.name}</h3>
                          <p className="text-xs text-gray-500">{new Date(order.timestamp).toLocaleString()}</p>
                       </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${info.bg} ${info.color}`}>
                       {info.icon} <span>{info.label}</span>
                    </div>
                 </div>

                 {order.status !== 'cancelled' && order.status !== 'completed' && (
                   <div className="px-4 pt-4">
                     <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="absolute top-0 left-0 h-full bg-brand-500 transition-all duration-1000" style={{ width: `${(step / (totalSteps - 1)) * 100}%` }}></div>
                     </div>
                   </div>
                 )}

                 <div className="p-4">
                    <ul className="space-y-2 mb-4">
                       {order.items.map((item, idx) => (
                         <li key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-700 font-medium">{item.quantity}x {item.name}</span>
                            <span className="text-gray-500">R$ {(item.price * item.quantity).toFixed(2)}</span>
                         </li>
                       ))}
                    </ul>
                    <div className="flex flex-col sm:flex-row justify-between items-center border-t border-gray-100 pt-3 gap-3">
                       <div className="flex justify-between w-full sm:w-auto gap-4 items-center">
                           <span className="text-sm font-medium text-gray-500">{order.paymentMethod}</span>
                           <span className="text-lg font-bold text-gray-900">Total: R$ {order.total.toFixed(2)}</span>
                       </div>
                       
                       {restaurant?.whatsappNumber && (
                           <a 
                             href={`https://wa.me/55${restaurant.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, sobre o pedido #${order.id.slice(-6)} do Volpony...`)}`}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="w-full sm:w-auto bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors flex items-center justify-center gap-2 border border-green-200"
                           >
                             <MessageCircle size={16} /> Falar no WhatsApp
                           </a>
                       )}
                    </div>
                 </div>
               </div>
             );
          })
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
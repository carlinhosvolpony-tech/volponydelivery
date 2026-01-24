
import React, { useState } from 'react';
import { Order, OrderStatus, Restaurant, User, Address } from '../types';
import { Package, Clock, CheckCircle, Bike, ShoppingBag, XCircle, ChefHat, MapPin, Trash2, Home, Briefcase, PlusCircle, ArrowLeft } from 'lucide-react';
import { db } from '../services/data';

interface CustomerDashboardProps {
  orders: Order[];
  restaurants: Restaurant[];
  user: User;
  onUpdateStatus?: (orderId: string, status: OrderStatus) => void;
  onBackToHome: () => void;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ orders, restaurants, user, onUpdateStatus, onBackToHome }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses'>('orders');
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<Partial<Address>>({
    label: 'Casa',
    street: '',
    number: '',
    neighborhood: '',
    city: 'Volpony City',
    complement: ''
  });

  const myOrders = orders
    .filter(o => o.customerId === user.id)
    .sort((a, b) => b.timestamp - a.timestamp);

  const myAddresses = user.addresses || [];

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAddress: Address = {
      id: Math.random().toString(36).substr(2, 9),
      label: addressForm.label || 'Casa',
      street: addressForm.street || '',
      number: addressForm.number || '',
      neighborhood: addressForm.neighborhood || '',
      city: addressForm.city || 'Volpony City',
      complement: addressForm.complement || '',
      isDefault: myAddresses.length === 0
    };

    const updatedUser = { ...user, addresses: [...myAddresses, newAddress] };
    const allUsers = await db.getUsers();
    const updatedUsersList = allUsers.map(u => u.id === user.id ? updatedUser : u);
    await db.saveUsers(updatedUsersList);
    localStorage.setItem('volpony_session', JSON.stringify(updatedUser));
    
    setIsAddingAddress(false);
    setAddressForm({ label: 'Casa', street: '', number: '', neighborhood: '', city: 'Volpony City', complement: '' });
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Excluir este endereço?')) return;
    const updatedUser = { ...user, addresses: myAddresses.filter(a => a.id !== addressId) };
    const allUsers = await db.getUsers();
    const updatedUsersList = allUsers.map(u => u.id === user.id ? updatedUser : u);
    await db.saveUsers(updatedUsersList);
    localStorage.setItem('volpony_session', JSON.stringify(updatedUser));
  };

  const formatAddress = (addr: string | Address): string => {
    if (typeof addr === 'string') return addr;
    return `${addr.street}, ${addr.number} - ${addr.neighborhood}`;
  };

  const getStatusInfo = (status: OrderStatus, orderType: string) => {
     switch(status) {
       case 'pending': return { label: 'Aguardando Loja', icon: <Clock size={14}/>, color: 'text-yellow-600', bg: 'bg-yellow-100' };
       case 'preparing': return { label: 'Sendo Preparado', icon: <ChefHat size={14}/>, color: 'text-blue-600', bg: 'bg-blue-100' };
       case 'ready': return { label: orderType === 'delivery' ? 'Aguardando Entregador' : 'Pronto p/ Retirada', icon: <Package size={14}/>, color: 'text-orange-600', bg: 'bg-orange-100' };
       case 'heading_to_pickup': return { label: 'Entregador em Rota', icon: <MapPin size={14}/>, color: 'text-orange-600', bg: 'bg-orange-100' };
       case 'delivering': return { label: 'Saiu p/ Entrega', icon: <Bike size={14}/>, color: 'text-purple-600', bg: 'bg-purple-100' };
       case 'completed': return { label: 'Entregue', icon: <CheckCircle size={14}/>, color: 'text-green-600', bg: 'bg-green-100' };
       case 'cancelled': return { label: 'Cancelado', icon: <XCircle size={14}/>, color: 'text-red-600', bg: 'bg-red-100' };
       default: return { label: '...', icon: <Clock size={14}/>, color: 'text-gray-600', bg: 'bg-gray-100' };
     }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-3xl mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
           <h2 className="text-2xl font-bold text-gray-800">Minha Conta</h2>
           <button onClick={onBackToHome} className="text-brand-600 font-bold text-sm flex items-center gap-1">
             <ArrowLeft size={16}/> Voltar
           </button>
        </div>

        <div className="flex gap-2 p-1 bg-gray-200 rounded-2xl w-fit">
           <button 
             onClick={() => setActiveTab('orders')}
             className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'orders' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500'}`}
           >
             Meus Pedidos
           </button>
           <button 
             onClick={() => setActiveTab('addresses')}
             className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'addresses' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500'}`}
           >
             Endereços
           </button>
        </div>

        {activeTab === 'orders' && (
          <div className="space-y-4 animate-fadeIn">
            {myOrders.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                  <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-400 font-medium">Você ainda não fez nenhum pedido.</p>
               </div>
            ) : (
              myOrders.map(order => {
                 const restaurant = restaurants.find(r => r.id === order.restaurantId);
                 const info = getStatusInfo(order.status, order.orderType);
                 
                 return (
                   <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
                     <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                           <img src={restaurant?.image} className="w-10 h-10 rounded-xl object-cover border" />
                           <div>
                              <h3 className="font-bold text-gray-800 text-sm">{restaurant?.name}</h3>
                              <p className="text-[10px] text-gray-400 uppercase font-bold">
                                {new Date(order.timestamp).toLocaleDateString()} • {new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                           </div>
                        </div>
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${info.bg} ${info.color}`}>
                           {info.icon} <span>{info.label.toUpperCase()}</span>
                        </div>
                     </div>
                     <div className="p-4">
                        <div className="text-xs text-gray-600 space-y-1 mb-4">
                           {order.items.map((item, idx) => (
                             <div key={idx} className="flex justify-between">
                               <span>{item.quantity}x {item.name}</span>
                               <span className="font-mono">R$ {(item.price * item.quantity).toFixed(2)}</span>
                             </div>
                           ))}
                        </div>
                        
                        <div className="flex justify-between items-center pt-3 border-t border-dashed text-sm">
                           <div className="flex flex-col">
                             <span className="text-[10px] font-bold text-gray-400 uppercase">Endereço</span>
                             <span className="text-xs text-gray-700 font-medium">{formatAddress(order.customerAddress)}</span>
                           </div>
                           <div className="text-right">
                             <span className="text-[10px] font-bold text-gray-400 uppercase block">Total</span>
                             <span className="font-bold text-brand-600 text-lg">R$ {order.total.toFixed(2)}</span>
                           </div>
                        </div>
                     </div>
                   </div>
                 );
              })
            )}
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="space-y-4 animate-fadeIn">
            {!isAddingAddress ? (
              <>
                <div className="grid grid-cols-1 gap-3">
                  {myAddresses.map(addr => (
                    <div key={addr.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 group">
                       <div className="bg-brand-50 p-3 rounded-2xl text-brand-600">
                          {addr.label.toLowerCase() === 'casa' ? <Home size={20}/> : <Briefcase size={20}/>}
                       </div>
                       <div className="flex-1">
                          <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                            {addr.label}
                            {addr.isDefault && <span className="text-[9px] bg-brand-500 text-white px-1.5 py-0.5 rounded uppercase">Principal</span>}
                          </h4>
                          <p className="text-xs text-gray-500">{addr.street}, {addr.number}</p>
                       </div>
                       <button 
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                       >
                          <Trash2 size={18} />
                       </button>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setIsAddingAddress(true)}
                  className="w-full py-4 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 text-sm font-bold flex items-center justify-center gap-2 hover:bg-white hover:border-brand-300 hover:text-brand-600 transition-all"
                >
                  <PlusCircle size={20} /> Adicionar Novo Endereço
                </button>
              </>
            ) : (
              <form onSubmit={handleSaveAddress} className="bg-white p-6 rounded-3xl border shadow-md space-y-4 animate-slideUp">
                 <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                   <MapPin className="text-brand-500" /> Novo Endereço
                 </h3>
                 
                 <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Rótulo (ex: Casa, Trabalho)</label>
                    <div className="flex gap-2">
                       {['Casa', 'Trabalho', 'Outro'].map(l => (
                         <button 
                          key={l}
                          type="button"
                          onClick={() => setAddressForm({...addressForm, label: l})}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${addressForm.label === l ? 'bg-brand-600 border-brand-600 text-white' : 'bg-gray-50 text-gray-500'}`}
                         >
                           {l}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-3">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Rua / Logradouro</label>
                      <input required value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} className="w-full border rounded-xl p-3 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-brand-500" placeholder="Ex: Av. Principal" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nº</label>
                      <input required value={addressForm.number} onChange={e => setAddressForm({...addressForm, number: e.target.value})} className="w-full border rounded-xl p-3 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-brand-500" placeholder="123" />
                    </div>
                 </div>

                 <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Bairro</label>
                    <input required value={addressForm.neighborhood} onChange={e => setAddressForm({...addressForm, neighborhood: e.target.value})} className="w-full border rounded-xl p-3 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-brand-500" placeholder="Ex: Centro" />
                 </div>

                 <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setIsAddingAddress(false)} className="flex-1 py-3 text-gray-500 font-bold text-sm">Cancelar</button>
                    <button type="submit" className="flex-1 py-3 bg-brand-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-500/20">Salvar Endereço</button>
                 </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;

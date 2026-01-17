
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import RestaurantCard from './components/RestaurantCard';
import CartSheet from './components/CartSheet';
import AIChat from './components/AIChat';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import CustomerDashboard from './components/CustomerDashboard';
import { db, INITIAL_CATEGORIES } from './services/data'; 
import { Restaurant, MenuItem, CartItem, AppView, GlobalSettings, User, Order, Address } from './types';
import { ArrowLeft, CheckCircle, Clock, Plus, Zap, Store, Loader2, MessageCircle, MapPin } from 'lucide-react';

function App() {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [lastOrderDetails, setLastOrderDetails] = useState<Order | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [r, s, u] = await Promise.all([
        db.getRestaurants(),
        db.getSettings(),
        db.getUsers()
      ]);
      setRestaurants(r);
      setSettings(s);
      setUsers(u);

      const savedUserStr = localStorage.getItem('volpony_session');
      if (savedUserStr) {
        const uObj = JSON.parse(savedUserStr);
        const latestUser = u.find(x => x.id === uObj.id);
        if (latestUser) {
          setCurrentUser(latestUser);
          if (latestUser.addresses?.length && !selectedAddress) setSelectedAddress(latestUser.addresses[0]);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    }
  }, [selectedAddress]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadData();
      setIsLoading(false);
    };
    init();
  }, [loadData]);

  const subtotal = cart.reduce((a,b) => a + (b.price * b.quantity), 0);
  const activeRestaurant = selectedRestaurant || (cart.length > 0 ? restaurants.find(r => r.id === cart[0].restaurantId) : null);
  const effectiveDeliveryFee = (orderType === 'delivery' && activeRestaurant) ? activeRestaurant.deliveryFee : 0;
  const total = subtotal + effectiveDeliveryFee;

  const handleRestaurantClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setOrderType('delivery');
    setView(AppView.RESTAURANT_DETAILS);
    window.scrollTo(0, 0);
  };

  const addToCart = (item: MenuItem) => {
    if (!selectedRestaurant) return;
    setCart(prev => {
      const isDifferent = prev.length > 0 && prev[0].restaurantId !== selectedRestaurant.id;
      if (isDifferent && !window.confirm("Você já tem itens de outra loja. Deseja limpar o carrinho?")) return prev;
      let newCart = isDifferent ? [] : [...prev];
      const existing = newCart.find(i => i.id === item.id);
      if (existing) return newCart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...newCart, { ...item, quantity: 1, restaurantId: selectedRestaurant.id, restaurantName: selectedRestaurant.name }];
    });
    setIsCartOpen(true);
  };

  const confirmOrder = () => {
    if (orderType === 'delivery' && !selectedAddress) return alert("Por favor, selecione um endereço para entrega.");
    if (!paymentMethod) return alert("Selecione a forma de pagamento.");
    if (!activeRestaurant) return;
    
    const addrText = orderType === 'pickup' 
      ? 'Retirada na Loja' 
      : `${selectedAddress?.street}, ${selectedAddress?.number} - ${selectedAddress?.neighborhood}`;

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      customerName: currentUser?.name || 'Cliente',
      customerAddress: addrText,
      items: [...cart],
      total: total,
      timestamp: Date.now(),
      restaurantId: activeRestaurant.id,
      restaurantName: activeRestaurant.name,
      orderType: orderType,
      paymentMethod: paymentMethod,
      status: 'pending',
      customerId: currentUser?.id || 'guest'
    };
    
    setLastOrderDetails(newOrder);
    setCart([]);
    setView(AppView.SUCCESS);
    window.scrollTo(0, 0);
  };

  const handleSendWhatsApp = () => {
    if (!lastOrderDetails || !activeRestaurant?.whatsappNumber) return;
    const itemsText = lastOrderDetails.items.map(i => `• ${i.quantity}x ${i.name} - R$ ${(i.price * i.quantity).toFixed(2)}`).join('\n');
    const deliveryLine = lastOrderDetails.orderType === 'delivery' ? `Taxa Entrega: R$ ${effectiveDeliveryFee.toFixed(2)}` : 'Retirada na Loja';
    
    const message = `*VOLPONY DELIVERY* 🍃
----------------------------
*PEDIDO:* #${lastOrderDetails.id}
*LOJA:* ${lastOrderDetails.restaurantName}
----------------------------
*CLIENTE:* ${lastOrderDetails.customerName}
*TIPO:* ${lastOrderDetails.orderType === 'delivery' ? '🛵 Entrega' : '🥡 Retirada'}
*ENDEREÇO:* ${lastOrderDetails.customerAddress}
----------------------------
*ITENS:*
${itemsText}
----------------------------
${deliveryLine}
*TOTAL:* R$ ${lastOrderDetails.total.toFixed(2)}
----------------------------
*PAGAMENTO:* ${lastOrderDetails.paymentMethod}
----------------------------
_Pedido feito via Volpony Delivery_`;

    window.open(`https://wa.me/${activeRestaurant.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-brand-500" size={40} /></div>;

  const currentCategories = settings?.categories || INITIAL_CATEGORIES;

  if (view === AppView.ADMIN_PANEL && settings) {
    return (
      <AdminPanel 
        restaurants={restaurants} 
        settings={settings} 
        users={users} 
        currentUser={currentUser} 
        onSaveRestaurant={async (r) => { const newR = restaurants.some(x => x.id === r.id) ? restaurants.map(x => x.id === r.id ? r : x) : [r, ...restaurants]; setRestaurants(newR); await db.saveRestaurants(newR); }}
        onDeleteRestaurant={async (id) => { const newR = restaurants.filter(x => x.id !== id); setRestaurants(newR); await db.saveRestaurants(newR); }}
        onSaveSettings={async (s) => { setSettings(s); await db.saveSettings(s); }}
        onSaveUser={async (u) => { const newU = users.some(x => x.id === u.id) ? users.map(x => x.id === u.id ? u : x) : [...users, u]; setUsers(newU); await db.saveUsers(newU); }}
        onDeleteUser={async (id) => { const newU = users.filter(x => x.id !== id); setUsers(newU); await db.saveUsers(newU); }}
        onClose={() => setView(AppView.HOME)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)} 
        currentUser={currentUser} 
        onCartClick={() => setIsCartOpen(true)} 
        onLogoClick={() => setView(AppView.HOME)} 
        onLoginClick={() => setView(AppView.LOGIN)} 
        onLogoutClick={() => { setCurrentUser(null); localStorage.removeItem('volpony_session'); setView(AppView.HOME); }} 
        onProfileClick={() => setView(AppView.CUSTOMER_DASHBOARD)} 
        onOrdersClick={() => setView(AppView.CUSTOMER_DASHBOARD)} 
        onAdminClick={() => setView(AppView.ADMIN_PANEL)} 
      />
      
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pt-6 pb-24">
        {view === AppView.HOME && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-brand-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                 <h2 className="text-3xl font-bold mb-2">Volpony Delivery</h2>
                 <p className="text-brand-200">Qualidade e rapidez em um clique.</p>
               </div>
               <Zap className="absolute right-[-20px] bottom-[-20px] text-white opacity-10 w-48 h-48" />
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {currentCategories.map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => setSelectedCategory(cat.id)} 
                  className={`flex flex-col items-center gap-2 min-w-[90px] p-4 rounded-2xl transition-all border ${selectedCategory === cat.id ? 'bg-brand-600 text-white shadow-lg scale-105' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs font-bold">{cat.name}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants
                .filter(r => r.active !== false)
                .filter(r => selectedCategory === 'all' || r.category === selectedCategory)
                .map(r => <RestaurantCard key={r.id} restaurant={r} categories={currentCategories} onClick={handleRestaurantClick} />)}
            </div>
          </div>
        )}

        {view === AppView.RESTAURANT_DETAILS && selectedRestaurant && (
          <div className="animate-fadeIn">
            <button onClick={() => setView(AppView.HOME)} className="mb-6 flex items-center text-gray-500 font-bold hover:text-brand-600"><ArrowLeft size={20} className="mr-2" /> Voltar</button>
            
            <div className="bg-white rounded-3xl shadow-sm border overflow-hidden mb-8">
               <img src={selectedRestaurant.image} className="w-full h-48 md:h-64 object-cover" />
               <div className="p-6">
                 <h1 className="text-3xl font-bold text-gray-800">{selectedRestaurant.name}</h1>
                 <p className="text-gray-500 flex items-center gap-1 mt-1"><Clock size={16}/> {selectedRestaurant.deliveryTime}</p>
               </div>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-6">Cardápio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {selectedRestaurant.menu.filter(item => item.active !== false).map(item => (
                 <div key={item.id} className="bg-white p-4 rounded-2xl border flex gap-4 hover:shadow-md transition-shadow">
                    <div className="flex-1 flex flex-col justify-between">
                       <div><h3 className="font-bold text-gray-800">{item.name}</h3><p className="text-xs text-gray-500 mt-1">{item.description}</p></div>
                       <div className="flex justify-between items-center mt-4">
                          <span className="font-bold text-brand-700">R$ {item.price.toFixed(2)}</span>
                          <button onClick={() => addToCart(item)} className="p-2 rounded-xl text-white bg-brand-600 hover:bg-brand-700 transition-colors"><Plus size={20}/></button>
                       </div>
                    </div>
                    <img src={item.image} className="w-24 h-24 rounded-2xl object-cover shadow-sm" />
                 </div>
               ))}
            </div>
          </div>
        )}

        {view === AppView.CHECKOUT && activeRestaurant && (
          <div className="max-w-2xl mx-auto animate-fadeIn">
            <button onClick={() => setView(AppView.RESTAURANT_DETAILS)} className="mb-6 flex items-center text-gray-500 font-bold hover:text-brand-600">
              <ArrowLeft size={20} className="mr-2" /> Voltar ao Cardápio
            </button>
            
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Store size={20} className="text-brand-500"/> Como deseja receber?</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setOrderType('delivery')} className={`py-3 rounded-2xl font-bold border transition-all ${orderType === 'delivery' ? 'bg-brand-500 border-brand-500 text-white shadow-lg' : 'bg-gray-50 text-gray-500'}`}>Entrega</button>
                  <button onClick={() => setOrderType('pickup')} className={`py-3 rounded-2xl font-bold border transition-all ${orderType === 'pickup' ? 'bg-brand-500 border-brand-500 text-white shadow-lg' : 'bg-gray-50 text-gray-500'}`}>Retirada</button>
                </div>
              </div>

              {orderType === 'delivery' && (
                <div className="bg-white p-6 rounded-3xl border shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><MapPin size={20} className="text-brand-500"/> Endereço de Entrega</h3>
                  {currentUser?.addresses?.length ? (
                    <div className="space-y-2">
                      {currentUser.addresses.map(addr => (
                        <div key={addr.id} onClick={() => setSelectedAddress(addr)} className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedAddress?.id === addr.id ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100' : 'border-gray-100'}`}>
                          <p className="font-bold text-sm">{addr.label}</p>
                          <p className="text-xs text-gray-500">{addr.street}, {addr.number} - {addr.neighborhood}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <button onClick={() => setView(AppView.CUSTOMER_DASHBOARD)} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm font-bold">Cadastrar novo endereço</button>
                  )}
                </div>
              )}

              <div className="bg-white p-6 rounded-3xl border shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">Forma de Pagamento</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['Dinheiro', 'Cartão', 'PIX'].map(method => (
                    <button key={method} onClick={() => setPaymentMethod(method)} className={`p-4 rounded-2xl border text-center font-medium transition-all ${paymentMethod === method ? 'border-brand-500 bg-brand-50 text-brand-700 font-bold' : 'border-gray-100'}`}>{method}</button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border shadow-sm">
                <div className="space-y-3 text-sm text-gray-600 mb-6">
                  <div className="flex justify-between"><span>Subtotal</span><span>R$ {subtotal.toFixed(2)}</span></div>
                  {orderType === 'delivery' && <div className="flex justify-between"><span>Taxa de Entrega</span><span>R$ {effectiveDeliveryFee.toFixed(2)}</span></div>}
                  <div className="flex justify-between font-bold text-xl text-gray-800 pt-3 border-t"><span>Total</span><span>R$ {total.toFixed(2)}</span></div>
                </div>
                <button onClick={confirmOrder} className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-brand-100 hover:bg-brand-700 transition-all">Confirmar Pedido</button>
              </div>
            </div>
          </div>
        )}

        {view === AppView.SUCCESS && lastOrderDetails && (
          <div className="max-w-md mx-auto py-10 px-4 animate-fadeIn">
            <div className="text-center mb-8">
               <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} /></div>
               <h2 className="text-2xl font-bold text-gray-800">Pedido Gerado!</h2>
               <p className="text-gray-500 text-sm">Quase lá! Clique no botão abaixo para finalizar pelo WhatsApp.</p>
            </div>

            <div className="thermal-paper p-6 mb-8 text-sm font-mono border-t-4 border-brand-500 shadow-xl">
               <div className="text-center mb-4">
                  <h3 className="font-bold">VOLPONY DELIVERY</h3>
                  <p className="text-[10px]">{lastOrderDetails.restaurantName}</p>
                  <div className="border-b border-dashed border-gray-300 my-2"></div>
                  <p className="font-bold">PEDIDO: #{lastOrderDetails.id}</p>
               </div>
               <div className="space-y-1 mb-4">
                  <p><b>Cliente:</b> {lastOrderDetails.customerName}</p>
                  <p className="break-words"><b>Local:</b> {typeof lastOrderDetails.customerAddress === 'string' ? lastOrderDetails.customerAddress : 'Endereço registrado'}</p>
               </div>
               <div className="border-b border-dashed border-gray-300 my-2"></div>
               <div className="space-y-1 mb-4">
                  {lastOrderDetails.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between"><span>{item.quantity}x {item.name}</span><span>R$ {(item.price * item.quantity).toFixed(2)}</span></div>
                  ))}
               </div>
               <div className="border-b border-dashed border-gray-300 my-2"></div>
               <div className="flex justify-between font-bold text-lg pt-2"><span>TOTAL</span><span>R$ {lastOrderDetails.total.toFixed(2)}</span></div>
               <p className="text-center font-bold mt-4">PAGAMENTO: {lastOrderDetails.paymentMethod}</p>
            </div>

            <div className="space-y-3">
               <button onClick={handleSendWhatsApp} className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-100 hover:bg-green-600 transition-all active:scale-95"><MessageCircle size={24} /> Enviar p/ WhatsApp</button>
               <button onClick={() => setView(AppView.HOME)} className="w-full bg-white text-gray-400 py-4 rounded-2xl font-bold border border-gray-200 hover:bg-gray-50 transition-all">Voltar ao Início</button>
            </div>
          </div>
        )}
      </main>

      {view === AppView.LOGIN && <Login users={users} onLogin={(u) => { setCurrentUser(u); localStorage.setItem('volpony_session', JSON.stringify(u)); setView(AppView.HOME); }} onRegister={async (u) => { const newU = [...users, u]; await db.saveUsers(newU); setCurrentUser(u); localStorage.setItem('volpony_session', JSON.stringify(u)); setView(AppView.HOME); }} onCancel={() => setView(AppView.HOME)} />}
      {view === AppView.CUSTOMER_DASHBOARD && currentUser && <CustomerDashboard orders={[]} restaurants={restaurants} user={currentUser} onBackToHome={() => setView(AppView.HOME)} />}
      
      <CartSheet isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} onUpdateQuantity={(id, d) => setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + d) } : i).filter(i => i.quantity > 0))} onCheckout={() => { setIsCartOpen(false); setView(AppView.CHECKOUT); }} />
      <AIChat restaurants={restaurants} />
    </div>
  );
}

export default App;


import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import RestaurantCard from './components/RestaurantCard';
import CartSheet from './components/CartSheet';
import AIChat from './components/AIChat';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import { db, INITIAL_CATEGORIES } from './services/data'; 
import { Restaurant, MenuItem, CartItem, AppView, GlobalSettings, User, Order, Category } from './types';
import { ArrowLeft, CheckCircle, Clock, Plus, Zap, Store, Loader2, MessageCircle, Printer, Calendar, MapPin, Hash, Edit3 } from 'lucide-react';

function App() {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [initialEditId, setInitialEditId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
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
    } catch (error) {
      console.error("Failed to load app data", error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadData();
      setIsLoading(false);
      const savedUserStr = localStorage.getItem('volpony_session');
      if (savedUserStr) setCurrentUser(JSON.parse(savedUserStr));
    };
    init();
    const sub = db.subscribeToChanges(() => loadData());
    return () => sub.unsubscribe();
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
      if (isDifferent && !window.confirm("Seu carrinho já tem itens de outra loja. Deseja limpar e adicionar este?")) return prev;
      let newCart = isDifferent ? [] : [...prev];
      const existing = newCart.find(i => i.id === item.id);
      if (existing) return newCart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...newCart, { ...item, quantity: 1, restaurantId: selectedRestaurant.id, restaurantName: selectedRestaurant.name }];
    });
    setIsCartOpen(true);
  };

  const confirmOrder = async () => {
    if (!paymentMethod) return alert("Selecione uma forma de pagamento.");
    if (!activeRestaurant) return;
    
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      customerName: currentUser?.name || 'Cliente',
      customerAddress: 'Endereço a confirmar no WhatsApp',
      items: [...cart],
      total: total,
      status: 'pending',
      timestamp: Date.now(),
      restaurantId: activeRestaurant.id,
      orderType: orderType,
      paymentMethod: paymentMethod,
      appFee: 0
    };
    
    try {
        const currentOrders = await db.getOrders();
        await db.saveOrders([...currentOrders, newOrder]);
        setLastOrderDetails(newOrder);
        setCart([]);
        setView(AppView.SUCCESS);
        window.scrollTo(0, 0);
    } catch (e) {
        alert("Erro ao processar pedido.");
    }
  };

  const handleSendWhatsApp = () => {
    if (!lastOrderDetails || !activeRestaurant?.whatsappNumber) return;
    
    // Calculamos os valores diretamente do lastOrderDetails para evitar subtotal 0
    const orderSubtotal = lastOrderDetails.items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const orderDeliveryFee = lastOrderDetails.orderType === 'delivery' ? (activeRestaurant.deliveryFee || 0) : 0;
    
    // Formatação de itens estilo tabela
    const itemsText = lastOrderDetails.items.map(i => 
      `${i.quantity}x ${i.name}\n   R$ ${(i.price * i.quantity).toFixed(2)}`
    ).join('\n');

    const message = `*VOLPONY DELIVERY* 🍃
--------------------------------
*COMPROVANTE DE PEDIDO*
--------------------------------
*LOJA:* ${activeRestaurant.name}
*DATA:* ${new Date(lastOrderDetails.timestamp).toLocaleDateString()} ${new Date(lastOrderDetails.timestamp).toLocaleTimeString()}
*PEDIDO:* #${lastOrderDetails.id}
*CLIENTE:* ${lastOrderDetails.customerName}
--------------------------------
*ITENS:*
${itemsText}
--------------------------------
*SUBTOTAL:* R$ ${orderSubtotal.toFixed(2)}
*TAXA ENTREGA:* R$ ${orderDeliveryFee.toFixed(2)}
*TOTAL:* R$ ${lastOrderDetails.total.toFixed(2)}
--------------------------------
*TIPO:* ${lastOrderDetails.orderType === 'delivery' ? '🛵 Entrega' : '🏪 Retirada'}
*PAGAMENTO:* ${lastOrderDetails.paymentMethod}
--------------------------------
_Obrigado pela preferência!_`;

    const phone = activeRestaurant.whatsappNumber.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const canEditSelectedRestaurant = currentUser && (
    currentUser.role === 'admin' || 
    (currentUser.role === 'manager' && currentUser.restaurantId === selectedRestaurant?.id)
  );

  const handleDirectEdit = () => {
    if (selectedRestaurant) {
      setInitialEditId(selectedRestaurant.id);
      setView(AppView.ADMIN_PANEL);
    }
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
        initialEditId={initialEditId}
        onSaveRestaurant={async (r) => { 
          const newR = restaurants.some(x => x.id === r.id) ? restaurants.map(x => x.id === r.id ? r : x) : [...restaurants, r];
          setRestaurants(newR); await db.saveRestaurants(newR); 
        }}
        onDeleteRestaurant={async (id) => {
          const newR = restaurants.filter(x => x.id !== id);
          setRestaurants(newR); await db.saveRestaurants(newR);
        }}
        onSaveSettings={async (s) => { setSettings(s); await db.saveSettings(s); }}
        onSaveUser={async (u) => {
          const newU = users.some(x => x.id === u.id) ? users.map(x => x.id === u.id ? u : x) : [...users, u];
          setUsers(newU); await db.saveUsers(newU);
        }}
        onDeleteUser={async (id) => {
          const newU = users.filter(x => x.id !== id);
          setUsers(newU); await db.saveUsers(newU);
        }}
        onClose={() => { setView(AppView.HOME); setInitialEditId(null); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartCount={cart.reduce((a, b) => a + b.quantity, 0)} currentUser={currentUser} onCartClick={() => setIsCartOpen(true)} onLogoClick={() => setView(AppView.HOME)} onLoginClick={() => setView(AppView.LOGIN)} onLogoutClick={() => { setCurrentUser(null); localStorage.removeItem('volpony_session'); setView(AppView.HOME); }} onProfileClick={() => setView(AppView.CUSTOMER_DASHBOARD)} onOrdersClick={() => setView(AppView.CUSTOMER_DASHBOARD)} onAdminClick={() => { setInitialEditId(null); setView(AppView.ADMIN_PANEL); }} />
      
      <main className="max-w-5xl mx-auto px-4 pt-6 pb-24">
        {view === AppView.HOME && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-brand-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                 <h2 className="text-3xl font-bold mb-2">Volpony Delivery</h2>
                 <p className="text-brand-200">Escolha o ramo, peça e receba via WhatsApp.</p>
               </div>
               <Zap className="absolute right-[-20px] bottom-[-20px] text-white opacity-10 w-48 h-48" />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {currentCategories.map(cat => (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`flex flex-col items-center gap-2 min-w-[90px] p-4 rounded-2xl transition-all border ${selectedCategory === cat.id ? 'bg-brand-600 text-white shadow-lg scale-105' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs font-bold">{cat.name}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.filter(r => r.active !== false).filter(r => selectedCategory === 'all' || r.category === selectedCategory).map(r => <RestaurantCard key={r.id} restaurant={r} categories={currentCategories} onClick={handleRestaurantClick} />)}
            </div>
          </div>
        )}

        {view === AppView.RESTAURANT_DETAILS && selectedRestaurant && (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => setView(AppView.HOME)} className="flex items-center text-gray-500 hover:text-brand-600 font-bold transition-colors">
                <ArrowLeft size={20} className="mr-2" /> Voltar
              </button>
              
              {canEditSelectedRestaurant && (
                <button 
                  onClick={handleDirectEdit} 
                  className="bg-dark-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-all shadow-md"
                >
                  <Edit3 size={18} /> Editar Estabelecimento
                </button>
              )}
            </div>
            <div className="bg-white rounded-3xl shadow-sm border overflow-hidden mb-8">
               <img src={selectedRestaurant.image} className="w-full h-48 md:h-64 object-cover" />
               <div className="p-6">
                 <h1 className="text-3xl font-bold text-gray-800">{selectedRestaurant.name}</h1>
                 <p className="text-gray-500 flex items-center gap-1 mt-1"><Clock size={16}/> Entrega em {selectedRestaurant.deliveryTime}</p>
                 {selectedRestaurant.active === false && <p className="mt-2 text-xs font-bold text-red-600 uppercase">Atenção: Este estabelecimento está desativado no momento.</p>}
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {selectedRestaurant.menu.filter(item => item.active !== false).map(item => (
                 <div key={item.id} className="bg-white p-4 rounded-2xl border flex gap-4 hover:shadow-md transition-shadow">
                    <div className="flex-1 flex flex-col justify-between">
                       <div><h3 className="font-bold text-gray-800">{item.name}</h3><p className="text-xs text-gray-500 mt-1">{item.description}</p></div>
                       <div className="flex justify-between items-center mt-4">
                          <span className="font-bold text-brand-700 text-lg">R$ {item.price.toFixed(2)}</span>
                          <button 
                            disabled={selectedRestaurant.active === false}
                            onClick={() => addToCart(item)} 
                            className={`p-2 rounded-xl shadow-sm text-white ${selectedRestaurant.active === false ? 'bg-gray-300 cursor-not-allowed' : 'bg-brand-600'}`}
                          >
                            <Plus size={20}/>
                          </button>
                       </div>
                    </div>
                    <img src={item.image} className="w-24 h-24 rounded-2xl object-cover bg-gray-100" />
                 </div>
               ))}
               {selectedRestaurant.menu.filter(item => item.active !== false).length === 0 && (
                 <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed text-gray-400">
                    <p>Nenhum produto disponível no momento.</p>
                 </div>
               )}
            </div>
          </div>
        )}

        {view === AppView.CHECKOUT && (
           <div className="max-w-xl mx-auto space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-800">Finalizar Compra</h2>
              <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
                 <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                    <button className={`flex-1 py-3 rounded-xl font-bold transition-all ${orderType === 'delivery' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500'}`} onClick={() => setOrderType('delivery')}>Entrega (R$ {activeRestaurant?.deliveryFee.toFixed(2)})</button>
                    <button className={`flex-1 py-3 rounded-xl font-bold transition-all ${orderType === 'pickup' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500'}`} onClick={() => setOrderType('pickup')}>Retirada (Grátis)</button>
                 </div>
                 <div className="space-y-3">
                    <h3 className="font-bold text-gray-700">Pagamento no Recebimento</h3>
                    <div className="grid grid-cols-2 gap-3">
                       {['Dinheiro', 'PIX', 'Cartão Débito', 'Cartão Crédito'].map(m => (
                         <button key={m} onClick={() => setPaymentMethod(m)} className={`p-4 rounded-2xl border text-sm font-bold transition-all ${paymentMethod === m ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500' : 'border-gray-200'}`}>{m}</button>
                       ))}
                    </div>
                 </div>
                 <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>R$ {subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-gray-600"><span>Taxa de Entrega</span><span>R$ {effectiveDeliveryFee.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-xl text-gray-800 pt-3 border-t"><span>Total</span><span className="text-brand-600">R$ {total.toFixed(2)}</span></div>
                 </div>
                 <button onClick={confirmOrder} className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-brand-700 shadow-lg shadow-brand-500/20">Confirmar Pedido</button>
              </div>
           </div>
        )}

        {view === AppView.SUCCESS && lastOrderDetails && (
          <div className="max-w-md mx-auto py-10 animate-fadeIn space-y-8">
              <div className="text-center">
                 <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-brand-200">
                    <CheckCircle size={32} />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-800">Pedido Enviado!</h2>
                 <p className="text-gray-500 text-sm mt-1 px-10">Agora envie o cupom para o lojista via WhatsApp para validar seu pedido.</p>
              </div>

              {/* CUPOM TÉRMICO VISUAL */}
              <div className="thermal-paper px-6 pt-8 pb-10 font-mono text-gray-900 border-x border-gray-100">
                 <div className="text-center space-y-1 mb-6">
                    <div className="flex justify-center mb-2"><Zap className="text-brand-600" size={24} fill="currentColor"/></div>
                    <h3 className="font-bold text-lg leading-tight uppercase tracking-widest">Volpony Delivery</h3>
                    <p className="text-xs border-y border-black inline-block px-2 my-1">COMPROVANTE DE PEDIDO</p>
                    <p className="text-[11px] font-bold uppercase">{activeRestaurant?.name}</p>
                 </div>

                 <div className="text-[10px] space-y-1 mb-4">
                    <div className="flex justify-between"><span><Calendar size={10} className="inline mr-1"/> DATA:</span><span>{new Date(lastOrderDetails.timestamp).toLocaleDateString()} {new Date(lastOrderDetails.timestamp).toLocaleTimeString()}</span></div>
                    <div className="flex justify-between"><span><Hash size={10} className="inline mr-1"/> PEDIDO:</span><span className="font-bold">#{lastOrderDetails.id}</span></div>
                    <div className="flex justify-between"><span><MapPin size={10} className="inline mr-1"/> CLIENTE:</span><span className="font-bold">{lastOrderDetails.customerName}</span></div>
                 </div>

                 <div className="dot-divider"></div>

                 <div className="space-y-3 py-2">
                    <div className="grid grid-cols-12 text-[10px] font-bold uppercase">
                       <span className="col-span-2 text-center">QT</span>
                       <span className="col-span-6">ITEM</span>
                       <span className="col-span-4 text-right">VALOR</span>
                    </div>
                    {lastOrderDetails.items.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 text-[11px]">
                         <span className="col-span-2 text-center">{item.quantity}x</span>
                         <span className="col-span-6 uppercase leading-tight">{item.name}</span>
                         <span className="col-span-4 text-right">{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                 </div>

                 <div className="dot-divider"></div>

                 <div className="space-y-1 py-1">
                    <div className="flex justify-between text-[11px]"><span>SUBTOTAL</span><span>R$ {lastOrderDetails.items.reduce((acc, i) => acc + (i.price * i.quantity), 0).toFixed(2)}</span></div>
                    <div className="flex justify-between text-[11px]"><span>TAXA ENTREGA ({lastOrderDetails.orderType === 'delivery' ? 'SIM' : 'NÃO'})</span><span>R$ {(lastOrderDetails.orderType === 'delivery' ? activeRestaurant?.deliveryFee : 0)?.toFixed(2)}</span></div>
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-black mt-2">
                       <span>TOTAL</span>
                       <span>R$ {lastOrderDetails.total.toFixed(2)}</span>
                    </div>
                 </div>

                 <div className="mt-6 pt-2 border-t border-dashed border-gray-300 text-center space-y-1">
                    <p className="text-[10px] uppercase">Forma de Pagamento:</p>
                    <p className="text-xs font-bold uppercase underline decoration-double">{lastOrderDetails.paymentMethod}</p>
                    <p className="text-[9px] text-gray-400 mt-4 italic tracking-widest">--- OBRIGADO PELA PREFERENCIA ---</p>
                 </div>
              </div>

              <div className="space-y-3 pt-4">
                <button onClick={handleSendWhatsApp} className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20 active:scale-95">
                  <MessageCircle size={24} /> Enviar p/ WhatsApp da Loja
                </button>
                <button onClick={() => setView(AppView.HOME)} className="w-full bg-white text-gray-500 py-4 rounded-2xl font-bold text-sm border hover:bg-gray-50 transition-all">
                  Voltar ao Início
                </button>
              </div>
          </div>
        )}
      </main>

      {view === AppView.LOGIN && <Login users={users} onLogin={(u) => { setCurrentUser(u); localStorage.setItem('volpony_session', JSON.stringify(u)); setView(AppView.HOME); }} onRegister={async (u) => { const newU = [...users, u]; await db.saveUsers(newU); setCurrentUser(u); localStorage.setItem('volpony_session', JSON.stringify(u)); setView(AppView.HOME); }} onCancel={() => setView(AppView.HOME)} />}
      <CartSheet isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} onUpdateQuantity={(id, d) => setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + d) } : i).filter(i => i.quantity > 0))} onCheckout={() => { setIsCartOpen(false); setView(AppView.CHECKOUT); }} />
      <AIChat restaurants={restaurants} />
    </div>
  );
}

export default App;

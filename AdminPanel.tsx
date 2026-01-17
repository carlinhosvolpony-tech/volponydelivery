
import React, { useState, useEffect } from 'react';
import { Restaurant, MenuItem, GlobalSettings, User, Category } from '../types';
import { Plus, Trash2, Edit2, Save, X, Store, Users, Tag, Clock, Shield, Image as ImageIcon, PlusCircle, Check, ArrowLeft, LayoutDashboard, Smile, Calendar, Upload, Settings, Zap, Briefcase, Home, MapPin, Phone, MessageCircle } from 'lucide-react';

interface AdminPanelProps {
  restaurants: Restaurant[];
  settings: GlobalSettings;
  users: User[];
  currentUser: User | null;
  initialEditId?: string | null;
  onSaveRestaurant: (restaurant: Restaurant) => void;
  onDeleteRestaurant: (id: string) => void;
  onSaveSettings: (settings: GlobalSettings) => void;
  onSaveUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onClose: () => void;
  onViewDashboard?: (restaurantId: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  restaurants, settings, users, currentUser, initialEditId, onSaveRestaurant, onDeleteRestaurant, onSaveSettings, onSaveUser, onDeleteUser, onClose, onViewDashboard 
}) => {
  const [activeTab, setActiveTab] = useState<'restaurants' | 'users' | 'categories'>('restaurants');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '' });
  const [hasSecondShift, setHasSecondShift] = useState(false);
  
  const isAdmin = currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'manager';
  const currentCategories = settings.categories || [];

  const filteredRestaurants = isAdmin 
    ? restaurants 
    : restaurants.filter(r => r.id === currentUser?.restaurantId);

  const iconLibrary = [
    { label: 'Comida', icons: ['🍔', '🍕', '🍗', '🍟', '🥪', '🌭', '🌮', '🌯', '🥘', '🍱', '🍛', '🍜', '🍝', '🍣', '🥩', '🥗', '🍲'] },
    { label: 'Doces e Bebidas', icons: ['🍦', '🍰', '🍩', '🍫', '🍯', '🍪', '🍮', '🥤', '☕', '🍺', '🍷', '🍹'] },
    { label: 'Outros', icons: ['💊', '💄', '💅', '💇', '🧼', '🏥', '🦷', '🚖', '🏍️', '⛽', '🛠️', '🧺', '🏠', '🎁', '📱'] }
  ];

  const daysOfWeek = [
    { label: 'D', value: 0, full: 'Domingo' },
    { label: 'S', value: 1, full: 'Segunda' },
    { label: 'T', value: 2, full: 'Terça' },
    { label: 'Q', value: 3, full: 'Quarta' },
    { label: 'Q', value: 4, full: 'Quinta' },
    { label: 'S', value: 5, full: 'Sexta' },
    { label: 'S', value: 6, full: 'Sábado' },
  ];

  const [restaurantForm, setRestaurantForm] = useState<Restaurant | null>(null);
  const [userForm, setUserForm] = useState<User | null>(null);

  useEffect(() => {
    if (initialEditId) {
      const target = restaurants.find(r => r.id === initialEditId);
      if (target) {
        setEditingId(target.id);
        setRestaurantForm({ ...target, operatingDays: target.operatingDays || [0, 1, 2, 3, 4, 5, 6] });
        setHasSecondShift(!!target.openingTime2);
      }
    }
  }, [initialEditId, restaurants]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleDay = (day: number) => {
    if (!restaurantForm) return;
    const current = restaurantForm.operatingDays || [];
    const updated = current.includes(day) ? current.filter(d => d !== day) : [...current, day];
    setRestaurantForm({ ...restaurantForm, operatingDays: updated });
  };

  const handleEditRestaurant = (r: Restaurant) => {
    setEditingId(r.id);
    setRestaurantForm({ ...r, operatingDays: r.operatingDays || [0, 1, 2, 3, 4, 5, 6] });
    setHasSecondShift(!!r.openingTime2);
  };

  const handleCreateRestaurant = () => {
    if (!isAdmin) return alert("Apenas administradores podem criar novas lojas.");
    setEditingId('new');
    setRestaurantForm({
      id: Date.now().toString(),
      name: '',
      rating: 5.0,
      deliveryTime: '30-45 min',
      deliveryFee: 5.0,
      openingTime: '08:00',
      closingTime: '22:00',
      category: currentCategories[0]?.id || 'snacks',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
      menu: [],
      whatsappNumber: '',
      active: true,
      operatingDays: [0, 1, 2, 3, 4, 5, 6]
    });
    setHasSecondShift(false);
  };

  const saveRestaurant = () => {
    if (!restaurantForm?.name) return alert("Nome é obrigatório");
    if (!restaurantForm?.whatsappNumber) return alert("WhatsApp da loja é obrigatório para receber pedidos");
    const finalForm = { ...restaurantForm };
    if (!hasSecondShift) {
        finalForm.openingTime2 = undefined;
        finalForm.closingTime2 = undefined;
    }
    onSaveRestaurant(finalForm);
    setEditingId(null);
    setRestaurantForm(null);
  };

  const handleEditUser = (u: User) => {
    setEditingUserId(u.id);
    setUserForm({ ...u });
  };

  const handleCreateUser = () => {
    setEditingUserId('new');
    setUserForm({
      id: Date.now().toString(),
      name: '',
      username: '',
      password: '',
      whatsappNumber: '',
      role: 'customer'
    });
  };

  const saveUser = () => {
    if (!userForm?.username || !userForm?.password) return alert("Login e Senha são obrigatórios");
    onSaveUser(userForm);
    setEditingUserId(null);
    setUserForm(null);
  };

  const handleEditCategory = (cat: Category) => {
    if (cat.id === 'all') return;
    setEditingCategoryId(cat.id);
    setNewCategory({ name: cat.name, icon: cat.icon });
  };

  const saveCategory = () => {
    if (!newCategory.name || !newCategory.icon) return alert("Preencha nome e ícone");
    let updated: Category[];
    if (editingCategoryId) {
      updated = currentCategories.map(c => c.id === editingCategoryId ? { ...c, ...newCategory } : c);
    } else {
      const id = newCategory.name.toLowerCase().replace(/\s+/g, '-');
      updated = [...currentCategories, { id, ...newCategory }];
    }
    onSaveSettings({ ...settings, categories: updated });
    setNewCategory({ name: '', icon: '' });
    setEditingCategoryId(null);
  };

  const deleteCategory = (id: string) => {
    if (id === 'all') return;
    if (confirm("Remover esta categoria?")) {
      onSaveSettings({ ...settings, categories: currentCategories.filter(c => c.id !== id) });
    }
  };

  const addMenuItem = () => {
    if (!restaurantForm) return;
    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: 'Novo Item',
      description: 'Descrição aqui',
      price: 0,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      active: true
    };
    setRestaurantForm({ ...restaurantForm, menu: [...restaurantForm.menu, newItem] });
  };

  const updateMenuItem = (itemId: string, field: keyof MenuItem, value: any) => {
    if (!restaurantForm) return;
    const newMenu = restaurantForm.menu.map(item => item.id === itemId ? { ...item, [field]: value } : item);
    setRestaurantForm({ ...restaurantForm, menu: newMenu });
  };

  const deleteMenuItem = (itemId: string) => {
    if (!restaurantForm) return;
    setRestaurantForm({ ...restaurantForm, menu: restaurantForm.menu.filter(i => i.id !== itemId) });
  };

  if (editingId && restaurantForm) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 animate-fadeIn">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <button onClick={() => setEditingId(null)} className="flex items-center gap-2 text-gray-500 mb-6 font-bold hover:text-brand-600">
            <ArrowLeft size={20}/> Voltar ao Painel
          </button>
          
          <div className="bg-white rounded-3xl shadow-sm border p-6 space-y-8">
            <header className="flex justify-between items-center border-b pb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
                <Store className="text-brand-500" /> {editingId === 'new' ? 'Nova Loja' : 'Editar Estabelecimento'}
              </h2>
              <button onClick={saveRestaurant} className="bg-brand-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 transition-colors">
                Salvar Alterações
              </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <label className="block">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nome do Estabelecimento</span>
                  <input value={restaurantForm.name} onChange={e => setRestaurantForm({...restaurantForm, name: e.target.value})} className="w-full mt-1 border rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-brand-500 outline-none" />
                </label>

                <label className="block">
                  <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest flex items-center gap-1">
                    <MessageCircle size={12} /> WhatsApp de Pedidos (DDD + Número)
                  </span>
                  <input 
                    value={restaurantForm.whatsappNumber || ''} 
                    onChange={e => setRestaurantForm({...restaurantForm, whatsappNumber: e.target.value})} 
                    className="w-full mt-1 border rounded-xl p-3 bg-brand-50 border-brand-100 focus:ring-2 focus:ring-brand-500 outline-none font-bold" 
                    placeholder="Ex: 98912345678"
                  />
                  <p className="text-[10px] text-gray-400 mt-1 italic">Este número receberá os cupons de pedidos via WhatsApp.</p>
                </label>
                
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Categoria</span>
                    <select value={restaurantForm.category} onChange={e => setRestaurantForm({...restaurantForm, category: e.target.value})} className="w-full mt-1 border rounded-xl p-3 bg-gray-50">
                      {currentCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Taxa Entrega (R$)</span>
                    <input 
                      type="number" 
                      value={restaurantForm.deliveryFee} 
                      onChange={e => setRestaurantForm({...restaurantForm, deliveryFee: Number(e.target.value)})} 
                      className={`w-full mt-1 border rounded-xl p-3 ${!isAdmin ? 'bg-gray-100 cursor-not-allowed text-gray-400' : 'bg-gray-50'}`} 
                      disabled={!isAdmin} 
                    />
                    {!isAdmin && <p className="text-[9px] text-red-400 mt-1 font-bold">Bloqueado para gestores.</p>}
                  </label>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Dias de Funcionamento</span>
                  <div className="flex justify-between gap-1">
                    {daysOfWeek.map(day => (
                      <button 
                        key={day.value}
                        onClick={() => toggleDay(day.value)}
                        className={`w-9 h-9 rounded-lg font-bold text-xs transition-all ${restaurantForm.operatingDays?.includes(day.value) ? 'bg-brand-500 text-white shadow-md' : 'bg-white text-gray-300 border border-gray-100'}`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Turnos de Horário</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-[10px] font-bold text-brand-600">Turno Duplo?</span>
                      <div onClick={() => setHasSecondShift(!hasSecondShift)} className={`w-10 h-5 rounded-full relative transition-colors ${hasSecondShift ? 'bg-brand-500' : 'bg-gray-200'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${hasSecondShift ? 'left-5.5' : 'left-0.5'}`}></div>
                      </div>
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input type="time" value={restaurantForm.openingTime} onChange={e => setRestaurantForm({...restaurantForm, openingTime: e.target.value})} className="w-full border rounded-xl p-3 bg-gray-50 text-sm" />
                      <input type="time" value={restaurantForm.closingTime} onChange={e => setRestaurantForm({...restaurantForm, closingTime: e.target.value})} className="w-full border rounded-xl p-3 bg-gray-50 text-sm" />
                    </div>
                    {hasSecondShift && (
                      <div className="grid grid-cols-2 gap-4 animate-slideUp">
                        <input type="time" value={restaurantForm.openingTime2 || ''} onChange={e => setRestaurantForm({...restaurantForm, openingTime2: e.target.value})} className="w-full border-brand-100 border rounded-xl p-3 bg-brand-50 text-sm" />
                        <input type="time" value={restaurantForm.closingTime2 || ''} onChange={e => setRestaurantForm({...restaurantForm, closingTime2: e.target.value})} className="w-full border-brand-100 border rounded-xl p-3 bg-brand-50 text-sm" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Banner da Loja</span>
                  <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border">
                    <img src={restaurantForm.image} className="w-16 h-16 rounded-xl object-cover border" />
                    <label className="flex-1 cursor-pointer">
                      <div className="bg-white p-2 rounded-xl border border-brand-100 text-brand-600 font-bold text-sm text-center">Substituir Imagem</div>
                      <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, (b) => setRestaurantForm({...restaurantForm, image: b}))} />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-8 border-t">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">Gestão do Cardápio</h3>
                <button onClick={addMenuItem} className="bg-brand-50 text-brand-600 font-bold text-xs px-4 py-2 rounded-xl border border-brand-100 hover:bg-brand-100 transition-all">
                   + Adicionar Produto
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {restaurantForm.menu.map(item => (
                  <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative group hover:border-brand-200 transition-all">
                    <button onClick={() => deleteMenuItem(item.id)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md z-10">
                      <X size={14}/>
                    </button>
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-3">
                        <input value={item.name} onChange={e => updateMenuItem(item.id, 'name', e.target.value)} className="w-full font-bold text-gray-800 focus:bg-gray-50 px-1 py-0.5 rounded outline-none" placeholder="Nome" />
                        <textarea value={item.description} onChange={e => updateMenuItem(item.id, 'description', e.target.value)} className="w-full text-xs text-gray-500 focus:bg-gray-50 px-1 py-0.5 rounded outline-none resize-none" rows={2} placeholder="Descrição" />
                        <div className="flex items-center gap-1 font-bold text-brand-600">
                          <span className="text-[10px]">R$</span>
                          <input type="number" value={item.price} onChange={e => updateMenuItem(item.id, 'price', Number(e.target.value))} className="w-20 bg-transparent text-sm" />
                        </div>
                      </div>
                      <div className="relative group/img">
                        <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border">
                           {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-300" />}
                        </div>
                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-xl">
                          <Upload size={16} className="text-white" />
                          <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, (b) => updateMenuItem(item.id, 'image', b))} />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (editingUserId && userForm) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-xl border p-8 max-w-md w-full">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
            <Shield className="text-brand-500" /> {editingUserId === 'new' ? 'Novo Acesso' : 'Editar Acesso'}
          </h2>
          <div className="space-y-4">
            <label className="block">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Nome Completo</span>
              <input value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} className="w-full mt-1 border rounded-xl p-3 bg-gray-50 outline-none focus:ring-2 focus:ring-brand-500" />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold text-gray-400 uppercase">WhatsApp (DDD + Número)</span>
              <input value={userForm.whatsappNumber || ''} onChange={e => setUserForm({...userForm, whatsappNumber: e.target.value})} className="w-full mt-1 border rounded-xl p-3 bg-gray-50 outline-none focus:ring-2 focus:ring-brand-500" placeholder="Ex: 98912345678" />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Login</span>
                <input value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} className="w-full mt-1 border rounded-xl p-3 bg-gray-50" />
              </label>
              <label className="block">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Senha</span>
                <input type="text" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full mt-1 border rounded-xl p-3 bg-gray-50" />
              </label>
            </div>
            <label className="block">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Nível de Acesso</span>
              <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value as any})} className="w-full mt-1 border rounded-xl p-3 bg-gray-50">
                <option value="customer">Cliente</option>
                <option value="courier">Entregador</option>
                <option value="manager">Gestor de Loja</option>
                <option value="admin">Administrador</option>
              </select>
            </label>
            {userForm.role === 'manager' && (
              <label className="block">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Loja Vinculada</span>
                <select value={userForm.restaurantId || ''} onChange={e => setUserForm({...userForm, restaurantId: e.target.value})} className="w-full mt-1 border rounded-xl p-3 bg-brand-50 font-bold text-brand-700">
                  <option value="">Selecione a Loja...</option>
                  {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </label>
            )}
            <div className="flex gap-3 pt-6">
              <button onClick={() => setEditingUserId(null)} className="flex-1 py-3 text-gray-500 font-bold">Cancelar</button>
              <button onClick={saveUser} className="flex-1 py-3 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-100">Salvar Acesso</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="bg-brand-500 p-2 rounded-xl text-white"><Shield size={24}/></div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Painel Volpony</h1>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-all"><X size={24}/></button>
        </div>

        <nav className="flex gap-2 p-1.5 bg-gray-200 rounded-2xl w-fit">
          <button onClick={() => setActiveTab('restaurants')} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'restaurants' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500'}`}>Lojas</button>
          {isAdmin && (
            <>
              <button onClick={() => setActiveTab('users')} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'users' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500'}`}>Equipe</button>
              <button onClick={() => setActiveTab('categories')} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'categories' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500'}`}>Categorias</button>
            </>
          )}
        </nav>

        {activeTab === 'restaurants' && (
          <div className="bg-white rounded-3xl border shadow-sm overflow-hidden animate-fadeIn">
             <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <span className="font-bold text-gray-400 uppercase text-[10px]">
                  {isAdmin ? 'Lista Geral de Lojas' : 'Gerenciar Minha Loja'}
                </span>
                {isAdmin && <button onClick={handleCreateRestaurant} className="bg-brand-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:scale-105 transition-all shadow-md">+ Nova Loja</button>}
             </div>
             <div className="divide-y">
                {filteredRestaurants.map(r => (
                  <div key={r.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                       <img src={r.image} className={`w-12 h-12 rounded-xl object-cover ${!r.active && 'grayscale'}`} />
                       <div>
                         <h3 className="font-bold text-gray-800">{r.name}</h3>
                         <p className="text-xs text-gray-400 flex items-center gap-1">
                           {r.active ? <span className="text-green-500">● Ativa</span> : <span className="text-red-400">● Inativa</span>} • {r.menu.length} pratos
                         </p>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => handleEditRestaurant(r)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg" title="Editar Loja e Cardápio"><Edit2 size={20}/></button>
                       {isAdmin && <button onClick={() => onDeleteRestaurant(r.id)} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={20}/></button>}
                    </div>
                  </div>
                ))}
                {filteredRestaurants.length === 0 && (
                  <div className="p-10 text-center text-gray-400 text-sm">
                    {isManager ? 'Nenhum estabelecimento vinculado a este usuário.' : 'Nenhuma loja cadastrada.'}
                  </div>
                )}
             </div>
          </div>
        )}

        {activeTab === 'users' && isAdmin && (
          <div className="bg-white rounded-3xl border shadow-sm overflow-hidden animate-fadeIn">
             <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <span className="font-bold text-gray-400 uppercase text-[10px]">Gestão de Acessos</span>
                <button onClick={handleCreateUser} className="bg-brand-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md">+ Novo Usuário</button>
             </div>
             <div className="divide-y">
                {users.map(u => (
                  <div key={u.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 font-bold">{u.name[0]}</div>
                       <div>
                         <h3 className="font-bold text-gray-800 text-sm">{u.name}</h3>
                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{u.role} • {u.username}</p>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => handleEditUser(u)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={18}/></button>
                       <button onClick={() => onDeleteUser(u.id)} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'categories' && isAdmin && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-6">
               <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <label className="flex-1 w-full">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Nome da Categoria</span>
                    <input value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} className="w-full mt-1 border rounded-xl p-3 bg-gray-50 outline-none focus:ring-2 focus:ring-brand-500" placeholder="Ex: Marmitex" />
                  </label>
                  <label className="w-full sm:w-20">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Ícone</span>
                    <input value={newCategory.icon} readOnly className="w-full mt-1 border rounded-xl p-3 bg-gray-50 text-center text-xl" />
                  </label>
                  <button onClick={saveCategory} className="bg-brand-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-brand-100 hover:bg-brand-700 transition-all">
                    {editingCategoryId ? 'Atualizar' : 'Adicionar'}
                  </button>
               </div>
               
               <div className="space-y-4 pt-4 border-t border-gray-100">
                 <h4 className="text-[10px] font-bold text-gray-400 uppercase">Biblioteca de Ícones</h4>
                 <div className="space-y-4 max-h-40 overflow-y-auto scrollbar-hide pr-2">
                    {iconLibrary.map((group, idx) => (
                      <div key={idx} className="flex flex-wrap gap-2">
                        {group.icons.map(icon => (
                          <button key={icon} onClick={() => setNewCategory({...newCategory, icon})} className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xl transition-all ${newCategory.icon === icon ? 'bg-brand-500 text-white border-brand-500 shadow-md' : 'bg-gray-50 hover:bg-white border-gray-100'}`}>
                            {icon}
                          </button>
                        ))}
                      </div>
                    ))}
                 </div>
               </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
               {currentCategories.map(cat => (
                 <div key={cat.id} className="bg-white p-4 rounded-3xl border border-gray-100 text-center relative group hover:shadow-md transition-all cursor-pointer" onClick={() => handleEditCategory(cat)}>
                    <span className="text-4xl block mb-2">{cat.icon}</span>
                    <span className="text-xs font-bold text-gray-700">{cat.name}</span>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1">
                      {cat.id !== 'all' && (
                        <button onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }} className="bg-red-500 text-white p-1 rounded-full"><Trash2 size={12}/></button>
                      )}
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;

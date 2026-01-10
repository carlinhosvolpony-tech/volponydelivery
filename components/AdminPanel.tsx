
import React, { useState, useEffect } from 'react';
import { Restaurant, MenuItem, GlobalSettings, User, Category } from '../types';
import { Plus, Trash2, Edit2, Save, X, Store, Smartphone, Users, Tag, DollarSign, Clock, Shield, User as UserIcon, Lock, Check, Layers, Eye, EyeOff } from 'lucide-react';

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
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  restaurants, settings, users, currentUser, initialEditId, onSaveRestaurant, onDeleteRestaurant, onSaveSettings, onSaveUser, onDeleteUser, onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'restaurants' | 'users' | 'categories'>('restaurants');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '' });
  
  const isAdmin = currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'manager';

  const visibleRestaurants = isManager 
    ? restaurants.filter(r => r.id === currentUser?.restaurantId) 
    : restaurants;

  const currentCategories = settings.categories || [];

  const [formData, setFormData] = useState<Restaurant>({} as Restaurant);
  const [userFormData, setUserFormData] = useState<User>({} as User);

  useEffect(() => {
    if (initialEditId) {
      const target = restaurants.find(r => r.id === initialEditId);
      if (target) {
        setEditingId(target.id);
        setFormData({ ...target });
      }
    }
  }, [initialEditId, restaurants]);

  // --- Handlers para Categorias ---
  const handleAddCategory = () => {
    if (!newCategory.name || !newCategory.icon) return alert("Preencha nome e ícone.");
    const id = newCategory.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
    if (currentCategories.find(c => c.id === id)) return alert("Categoria já existe.");
    
    const updatedCategories = [...currentCategories, { id, ...newCategory }];
    onSaveSettings({ ...settings, categories: updatedCategories });
    setNewCategory({ name: '', icon: '' });
  };

  const handleDeleteCategory = (id: string) => {
    if (id === 'all') return alert("A categoria 'Tudo' não pode ser removida.");
    if (restaurants.some(r => r.category === id)) return alert("Não é possível remover: existem lojas vinculadas a esta categoria.");
    
    if (window.confirm("Deseja remover esta categoria?")) {
      const updatedCategories = currentCategories.filter(c => c.id !== id);
      onSaveSettings({ ...settings, categories: updatedCategories });
    }
  };

  // --- Handlers para Usuários ---
  const handleEditUser = (user: User) => {
    setEditingUserId(user.id);
    setUserFormData({ ...user });
  };

  const handleCreateUser = () => {
    setEditingUserId('new');
    setUserFormData({
      id: Date.now().toString(),
      name: '',
      username: '',
      password: '',
      role: 'manager',
      restaurantId: restaurants[0]?.id || ''
    });
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.name || !userFormData.username || !userFormData.password) {
      return alert("Por favor, preencha todos os campos obrigatórios.");
    }
    onSaveUser(userFormData);
    setEditingUserId(null);
  };

  // --- Handlers para Estabelecimentos ---
  const handleEdit = (restaurant: Restaurant) => {
    setEditingId(restaurant.id);
    setFormData({ ...restaurant });
    window.scrollTo(0, 0);
  };

  const handleCreate = () => {
    setEditingId('new');
    setFormData({
      id: Date.now().toString(),
      name: '',
      rating: 5.0,
      deliveryTime: '30-45 min',
      deliveryFee: 2.00,
      openingTime: '08:00',
      closingTime: '22:00',
      category: currentCategories[1]?.id || 'snacks',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      menu: [],
      acceptedPaymentMethods: ['Dinheiro', 'PIX', 'Cartão Débito', 'Cartão Crédito'],
      active: true
    });
    window.scrollTo(0, 0);
  };

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation(); 
    if (window.confirm(`⚠️ ATENÇÃO: Deseja realmente excluir "${name}"? Esta ação não pode ser desfeita.`)) {
      onDeleteRestaurant(id);
    }
  };

  const handleToggleActive = (e: React.MouseEvent, restaurant: Restaurant) => {
    e.stopPropagation();
    if (!isAdmin) return;
    const updated = { ...restaurant, active: restaurant.active === false };
    onSaveRestaurant(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category) return alert("Nome e categoria são obrigatórios.");
    onSaveRestaurant(formData);
    setEditingId(null);
  };

  if (editingUserId) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl border p-8 max-w-md w-full animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Shield className="text-brand-600" size={24} />
              {editingUserId === 'new' ? 'Novo Usuário' : 'Editar Acesso'}
            </h2>
            <button onClick={() => setEditingUserId(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X size={24}/></button>
          </div>

          <form onSubmit={handleUserSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Nome do Colaborador</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 text-gray-400" size={18} />
                <input required value={userFormData.name} onChange={e => setUserFormData({...userFormData, name: e.target.value})} className="w-full border rounded-xl p-3 pl-10 outline-none focus:ring-2 focus:ring-brand-500 bg-gray-50 border-gray-200" placeholder="Ex: Maria Gestora" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Usuário (Login)</label>
                 <input required value={userFormData.username} onChange={e => setUserFormData({...userFormData, username: e.target.value})} className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-brand-500 bg-gray-50 border-gray-200" placeholder="Ex: maria_loja" />
               </div>
               <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Senha</label>
                 <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input required type="text" value={userFormData.password} onChange={e => setUserFormData({...userFormData, password: e.target.value})} className="w-full border rounded-xl p-3 pl-10 outline-none focus:ring-2 focus:ring-brand-500 bg-gray-50 border-gray-200" placeholder="123456" />
                 </div>
               </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Cargo / Nível de Acesso</label>
              <select value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value as any})} className="w-full border rounded-xl p-3 bg-gray-50 border-gray-200 outline-none font-medium">
                <option value="manager">Lojista (Gestor de Estabelecimento)</option>
                <option value="admin">Administrador (Controle Total)</option>
                <option value="courier">Entregador Parceiro</option>
              </select>
            </div>
            
            {(userFormData.role === 'manager') && (
              <div className="bg-brand-50 p-4 rounded-2xl border border-brand-100">
                <label className="block text-xs font-bold text-brand-700 uppercase mb-1.5 tracking-wider">Vincular ao Estabelecimento</label>
                <select value={userFormData.restaurantId} onChange={e => setUserFormData({...userFormData, restaurantId: e.target.value})} className="w-full border rounded-xl p-3 bg-white border-brand-200 outline-none font-bold text-brand-900">
                  <option value="">Selecione uma loja...</option>
                  {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <p className="text-[10px] text-brand-600 mt-2">Este usuário poderá gerenciar apenas o estabelecimento selecionado.</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setEditingUserId(null)} className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-all">Cancelar</button>
              <button type="submit" className="flex-1 py-4 bg-brand-600 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition-all flex items-center justify-center gap-2">
                <Check size={20} /> Salvar Conta
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (editingId) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="bg-white rounded-3xl shadow-xl border p-6 animate-fadeIn max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8 pb-4 border-b">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Store className="text-brand-600" />
              {editingId === 'new' ? 'Novo Estabelecimento' : `Gerenciar: ${formData.name}`}
            </h2>
            <button onClick={() => setEditingId(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24}/></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {/* Coluna 1: Dados de Identidade */}
               <div className="space-y-6">
                 <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 space-y-4">
                    <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 uppercase tracking-widest"><Tag size={16}/> Identidade</h3>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nome Fantasia</label>
                      <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-brand-500 bg-white" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Ramo Comercial</label>
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border rounded-xl p-2.5 bg-white outline-none">
                        {currentCategories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">URL da Imagem de Capa</label>
                      <input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full border rounded-xl p-2.5 outline-none bg-white" placeholder="http://..." />
                    </div>
                    {isAdmin && (
                      <div className="pt-2 border-t">
                         <label className="flex items-center gap-2 cursor-pointer">
                           <input 
                             type="checkbox" 
                             checked={formData.active !== false} 
                             onChange={e => setFormData({...formData, active: e.target.checked})}
                             className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500" 
                           />
                           <span className="text-xs font-bold text-gray-700 uppercase">Estabelecimento Ativo</span>
                         </label>
                      </div>
                    )}
                 </div>

                 <div className="bg-blue-50 p-5 rounded-3xl border border-blue-100 space-y-4">
                    <h3 className="font-bold text-blue-800 text-sm flex items-center gap-2 uppercase tracking-widest"><Clock size={16}/> Funcionamento</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-blue-600 uppercase mb-1">Abre</label>
                        <input type="time" value={formData.openingTime} onChange={e => setFormData({...formData, openingTime: e.target.value})} className="w-full border border-blue-200 rounded-xl p-2 bg-white" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-blue-600 uppercase mb-1">Fecha</label>
                        <input type="time" value={formData.closingTime} onChange={e => setFormData({...formData, closingTime: e.target.value})} className="w-full border border-blue-200 rounded-xl p-2 bg-white" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-blue-600 uppercase mb-1">Tempo Médio de Entrega</label>
                      <input value={formData.deliveryTime} onChange={e => setFormData({...formData, deliveryTime: e.target.value})} className="w-full border border-blue-200 rounded-xl p-2 bg-white" placeholder="Ex: 30-40 min" />
                    </div>
                 </div>
               </div>

               {/* Coluna 2: Contato e Financeiro */}
               <div className="space-y-6">
                  <div className="bg-green-50 p-5 rounded-3xl border border-green-100 space-y-4">
                    <h3 className="font-bold text-green-800 text-sm flex items-center gap-2 uppercase tracking-widest"><Smartphone size={16}/> Comunicação</h3>
                    <div>
                      <label className="block text-[10px] font-bold text-green-600 uppercase mb-1">WhatsApp de Pedidos</label>
                      <input required placeholder="98988887777" value={formData.whatsappNumber || ''} onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} className="w-full border-green-200 rounded-xl p-2.5 bg-white outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-green-600 uppercase mb-1">Chave PIX (Opcional)</label>
                      <input value={formData.pixKey || ''} onChange={e => setFormData({...formData, pixKey: e.target.value})} className="w-full border-green-200 rounded-xl p-2.5 bg-white outline-none" />
                    </div>
                  </div>

                  <div className="bg-amber-50 p-5 rounded-3xl border border-amber-100 space-y-4">
                     <h3 className="font-bold text-amber-800 text-sm flex items-center gap-2 uppercase tracking-widest"><DollarSign size={16}/> Financeiro</h3>
                     <div className="relative group">
                       <label className={`block text-[10px] font-bold uppercase mb-1 ${isAdmin ? 'text-amber-600' : 'text-gray-400'}`}>
                         Taxa de Entrega (Apenas Admin)
                       </label>
                       <div className="relative">
                          <input 
                            type="number" 
                            step="0.50" 
                            disabled={!isAdmin}
                            value={formData.deliveryFee} 
                            onChange={e => setFormData({...formData, deliveryFee: parseFloat(e.target.value)})} 
                            className={`w-full border rounded-xl p-2.5 outline-none transition-all ${!isAdmin ? 'bg-gray-100 cursor-not-allowed opacity-60 border-gray-200' : 'bg-white border-amber-200 focus:ring-2 focus:ring-amber-500'}`} 
                          />
                          {!isAdmin && <Lock className="absolute right-3 top-2.5 text-gray-300" size={16} />}
                       </div>
                       {!isAdmin && <p className="text-[9px] text-gray-400 mt-1 italic leading-tight">* Somente o Administrador do Volpony pode alterar a taxa de entrega.</p>}
                     </div>
                     <div>
                       <label className="block text-[10px] font-bold text-amber-600 uppercase mb-1">Pedido Mínimo (R$)</label>
                       <input type="number" step="1.00" value={formData.minOrderValue || 0} onChange={e => setFormData({...formData, minOrderValue: parseFloat(e.target.value)})} className="w-full border border-amber-200 rounded-xl p-2.5 outline-none bg-white" />
                     </div>
                  </div>
               </div>
               
               {/* Coluna 3: Cardápio */}
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <h3 className="font-bold text-gray-800 text-sm uppercase tracking-widest">Produtos</h3>
                     <span className="bg-brand-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">{formData.menu.length} itens</span>
                  </div>
                  <div className="bg-gray-50 rounded-3xl p-4 border border-gray-100 space-y-3 max-h-[500px] overflow-y-auto shadow-inner">
                     {formData.menu.map((item, idx) => (
                       <div key={idx} className={`p-3 border border-gray-100 rounded-2xl flex gap-3 shadow-sm items-center relative group hover:border-brand-200 transition-all ${item.active === false ? 'bg-gray-200/50 grayscale' : 'bg-white'}`}>
                          <img src={item.image} className="w-10 h-10 rounded-xl object-cover border" />
                          <div className="flex-1">
                             <div className="flex items-center gap-2">
                               <input placeholder="Nome do Item" value={item.name} onChange={e => { const m = [...formData.menu]; m[idx].name = e.target.value; setFormData({...formData, menu: m}) }} className="w-full text-xs font-bold border-none outline-none focus:text-brand-600 bg-transparent" />
                               {item.active === false && <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase">Inativo</span>}
                             </div>
                             <div className="flex items-center text-[10px] text-brand-600 font-bold mt-1">
                                R$ <input type="number" step="0.01" value={item.price} onChange={e => { const m = [...formData.menu]; m[idx].price = parseFloat(e.target.value); setFormData({...formData, menu: m}) }} className="w-16 ml-1 bg-transparent outline-none border-b border-transparent focus:border-brand-300" />
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button 
                              type="button" 
                              title={item.active === false ? "Ativar Produto" : "Desativar Produto"}
                              onClick={() => { const m = [...formData.menu]; m[idx].active = item.active === false; setFormData({...formData, menu: m}) }} 
                              className={`p-1.5 rounded-lg transition-colors ${item.active === false ? 'text-gray-400 hover:text-green-600 hover:bg-green-50' : 'text-green-600 hover:text-gray-400 hover:bg-gray-100'}`}
                            >
                              {item.active === false ? <EyeOff size={16}/> : <Eye size={16}/>}
                            </button>
                            <button type="button" onClick={() => setFormData({...formData, menu: formData.menu.filter((_, i) => i !== idx)})} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                          </div>
                       </div>
                     ))}
                     <button type="button" onClick={() => setFormData({...formData, menu: [...formData.menu, { id: Date.now().toString(), name: 'Novo Produto', description: '', price: 0, image: 'https://images.unsplash.com/photo-1546272927-d043224c4999?auto=format&fit=crop&w=200&q=80', active: true }]})} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 text-xs font-bold hover:bg-white hover:border-brand-300 hover:text-brand-600 transition-all flex items-center justify-center gap-2">
                       <Plus size={16} /> Adicionar Item ao Cardápio
                     </button>
                  </div>
               </div>
            </div>

            <div className="flex justify-end gap-4 pt-8 border-t">
              <button type="button" onClick={() => setEditingId(null)} className="px-8 py-4 rounded-2xl text-gray-500 font-bold hover:bg-gray-100 transition-colors">Cancelar</button>
              <button type="submit" className="px-10 py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-xl shadow-brand-500/30 hover:bg-brand-700 transition-all flex items-center gap-2">
                <Save size={20} /> Salvar Estabelecimento
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Painel Administrativo</h1>
            <p className="text-gray-500 text-sm mt-0.5">Gestão Volpony Delivery • <span className="font-bold text-brand-600 uppercase text-[10px]">{currentUser?.role}</span></p>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border border-gray-100">
            <X size={24}/>
          </button>
        </div>

        <div className="flex gap-2 p-1 bg-gray-200/50 rounded-2xl w-fit">
          <button onClick={() => setActiveTab('restaurants')} className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 text-sm ${activeTab === 'restaurants' ? 'bg-white text-brand-600 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'}`}>
            <Store size={18} /> Lojas & Serviços
          </button>
          {isAdmin && (
            <>
              <button onClick={() => setActiveTab('users')} className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 text-sm ${activeTab === 'users' ? 'bg-white text-brand-600 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'}`}>
                <Users size={18} /> Usuários
              </button>
              <button onClick={() => setActiveTab('categories')} className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 text-sm ${activeTab === 'categories' ? 'bg-white text-brand-600 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-700'}`}>
                <Layers size={18} /> Categorias
              </button>
            </>
          )}
        </div>

        {activeTab === 'restaurants' && (
          <div className="animate-fadeIn space-y-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                <h2 className="font-bold text-gray-800 flex items-center gap-2 uppercase text-xs tracking-widest"><Store size={16} className="text-brand-500"/> Estabelecimentos Cadastrados</h2>
                {isAdmin && (
                  <button onClick={handleCreate} className="bg-brand-600 text-white px-6 py-2.5 rounded-2xl font-bold text-sm hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2">
                    <Plus size={18} /> Nova Loja
                  </button>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Estabelecimento</th>
                      <th className="px-6 py-4">Ramo</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Contato / WhatsApp</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {visibleRestaurants.map(r => (
                      <tr 
                        key={r.id} 
                        onClick={() => handleEdit(r)}
                        className={`hover:bg-brand-50/50 transition-colors cursor-pointer group ${r.active === false ? 'bg-gray-50 grayscale opacity-60' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                             <img src={r.image} className="w-12 h-12 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                             <span className="font-bold text-gray-800">{r.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-white border text-gray-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase border-gray-200">
                            {currentCategories.find(c => c.id === r.category)?.name || r.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${r.active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {r.active !== false ? 'Ativo' : 'Desativado'}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                          {r.whatsappNumber || 'Não informado'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {isAdmin && (
                              <button 
                                onClick={(e) => handleToggleActive(e, r)} 
                                className={`p-2 rounded-xl transition-colors border ${r.active === false ? 'text-green-600 bg-green-50 border-green-100 hover:bg-green-100' : 'text-gray-400 bg-gray-50 border-gray-100 hover:text-red-500 hover:bg-red-50'}`}
                                title={r.active === false ? "Ativar Estabelecimento" : "Desativar Estabelecimento"}
                              >
                                {r.active === false ? <Eye size={18}/> : <EyeOff size={18}/>}
                              </button>
                            )}
                            <div className="p-2 text-brand-600 bg-brand-50 rounded-xl group-hover:bg-brand-100 transition-colors border border-brand-100">
                              <Edit2 size={18}/>
                            </div>
                            {isAdmin && (
                              <button onClick={(e) => handleDelete(e, r.id, r.name)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors border border-transparent hover:border-red-100">
                                <Trash2 size={18}/>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && isAdmin && (
          <div className="animate-fadeIn space-y-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                  <h2 className="font-bold text-gray-800 flex items-center gap-2 uppercase text-xs tracking-widest"><Users size={16} className="text-brand-500"/> Contas de Lojistas e Acessos</h2>
                  <button onClick={handleCreateUser} className="bg-dark-900 text-white px-6 py-2.5 rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-xl flex items-center gap-2">
                    <Plus size={18} /> Novo Usuário
                  </button>
               </div>
               
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                       <tr>
                          <th className="px-6 py-4">Nome Completo</th>
                          <th className="px-6 py-4">Usuário / Login</th>
                          <th className="px-6 py-4">Cargo / Nível</th>
                          <th className="px-6 py-4">Loja Vinculada</th>
                          <th className="px-6 py-4 text-right">Gerenciar</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                       {users.map(user => (
                         <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-gray-800">{user.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 font-mono">{user.username}</td>
                            <td className="px-6 py-4">
                               <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                 user.role === 'admin' ? 'bg-red-50 text-red-700 border-red-100' : 
                                 user.role === 'manager' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-100 text-gray-600 border-gray-200'
                               }`}>
                                 {user.role}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-xs font-medium text-gray-500">
                               {user.role === 'manager' ? (restaurants.find(r => r.id === user.restaurantId)?.name || <span className="text-red-400 italic">Nenhuma Loja!</span>) : <span className="text-gray-300">Acesso Global</span>}
                            </td>
                            <td className="px-6 py-4 text-right">
                               <div className="flex justify-end gap-2">
                                  <button onClick={() => handleEditUser(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-100"><Edit2 size={16}/></button>
                                  <button onClick={() => { if(confirm('⚠️ Tem certeza que deseja remover este acesso?')) onDeleteUser(user.id) }} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"><Trash2 size={16}/></button>
                               </div>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && isAdmin && (
          <div className="animate-fadeIn space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-800 flex items-center gap-2 uppercase text-xs tracking-widest mb-6"><Layers size={16} className="text-brand-500"/> Criar Nova Categoria</h2>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nome da Categoria</label>
                  <input value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-brand-500 bg-gray-50" placeholder="Ex: Farmácia" />
                </div>
                <div className="w-32">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Emoji / Ícone</label>
                  <input value={newCategory.icon} onChange={e => setNewCategory({...newCategory, icon: e.target.value})} className="w-full border rounded-xl p-3 outline-none text-center text-xl bg-gray-50" placeholder="💊" />
                </div>
                <button onClick={handleAddCategory} className="bg-brand-600 text-white px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-brand-700 transition-all shadow-lg flex items-center gap-2">
                  <Plus size={18} /> Adicionar
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-6 border-b bg-gray-50/50">
                  <h2 className="font-bold text-gray-800 uppercase text-xs tracking-widest">Categorias Existentes</h2>
               </div>
               <div className="p-6">
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {currentCategories.map(cat => (
                      <div key={cat.id} className="relative group p-4 border rounded-2xl text-center bg-gray-50 hover:border-brand-300 transition-all">
                        <span className="text-3xl block mb-2">{cat.icon}</span>
                        <span className="text-xs font-bold text-gray-700 block">{cat.name}</span>
                        {cat.id !== 'all' && (
                          <button 
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <Trash2 size={12}/>
                          </button>
                        )}
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;

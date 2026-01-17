
import React, { useState } from 'react';
import { User } from '../types';
import { Zap, Lock, User as UserIcon, Type, Phone } from 'lucide-react';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
  onCancel: () => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin, onRegister, onCancel }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      if (!name || !username || !password || !whatsapp) return setError('Preencha todos os campos.');
      if (users.find(u => u.username === username)) return setError('Este nome de usuário já existe.');
      onRegister({ 
        id: Date.now().toString(), 
        name, 
        username, 
        password, 
        whatsappNumber: whatsapp,
        role: 'customer' 
      });
    } else {
      const user = users.find(u => u.username === username && u.password === password);
      if (user) onLogin(user);
      else setError('Usuário ou senha inválidos.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
        <div className="bg-brand-900 p-8 text-center">
          <div className="bg-brand-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap size={32} className="text-white" fill="currentColor" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isRegistering ? 'Nova Conta' : 'Acessar Volpony Delivery'}
          </h2>
          <p className="text-brand-200">Qualidade e rapidez na sua porta</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center font-medium">{error}</div>}
          
          {isRegistering && (
            <div className="space-y-4">
              <div className="relative">
                <UserIcon size={18} className="absolute left-3 top-3.5 text-gray-400" />
                <input 
                  placeholder="Nome Completo" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full border rounded-xl p-3 pl-10 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-brand-500 transition-all" 
                />
              </div>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-3.5 text-gray-400" />
                <input 
                  placeholder="WhatsApp (ex: 98912345678)" 
                  value={whatsapp} 
                  onChange={e => setWhatsapp(e.target.value)} 
                  className="w-full border rounded-xl p-3 pl-10 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-brand-500 transition-all" 
                />
              </div>
            </div>
          )}

          <div className="relative">
            <UserIcon size={18} className="absolute left-3 top-3.5 text-gray-400" />
            <input 
              placeholder="Nome de Usuário" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              className="w-full border rounded-xl p-3 pl-10 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-brand-500 transition-all" 
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
            <input 
              type="password" 
              placeholder="Senha" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full border rounded-xl p-3 pl-10 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-brand-500 transition-all" 
            />
          </div>
          
          <button type="submit" className="w-full bg-brand-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-brand-100 hover:bg-brand-700 transition-all active:scale-95">
            {isRegistering ? 'Criar Minha Conta' : 'Entrar Agora'}
          </button>
          
          <div className="text-center pt-2">
              <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-brand-600 text-sm font-bold hover:underline">
                {isRegistering ? 'Já possui uma conta? Clique aqui' : 'Ainda não é cadastrado? Crie sua conta'}
              </button>
          </div>
          <button type="button" onClick={onCancel} className="w-full text-gray-400 text-xs font-bold uppercase tracking-widest pt-4">Cancelar e Voltar</button>
        </form>
      </div>
    </div>
  );
};

export default Login;

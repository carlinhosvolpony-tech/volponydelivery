import React, { useState } from 'react';
import { User } from '../types';
import { Zap, Lock, User as UserIcon, Type } from 'lucide-react';

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
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      if (!name || !username || !password) {
        setError('Preencha todos os campos.');
        return;
      }
      if (users.find(u => u.username === username)) {
        setError('Este usuário já existe.');
        return;
      }

      const newUser: User = {
        id: Date.now().toString(),
        name,
        username,
        password,
        role: 'customer'
      };
      
      onRegister(newUser);
    } else {
      const user = users.find(u => u.username === username && u.password === password);
      
      if (user) {
        onLogin(user);
      } else {
        setError('Usuário ou senha incorretos.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
        <div className="bg-brand-900 p-8 text-center">
          <div className="bg-brand-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/30">
            <Zap size={32} className="text-white" fill="currentColor" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isRegistering ? 'Criar Conta' : 'Acessar Volpony'}
          </h2>
          <p className="text-brand-200">O app de pedidos de Arari</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center animate-pulse">
              {error}
            </div>
          )}

          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Type size={18} />
                </div>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="pl-10 block w-full rounded-lg border-gray-300 border p-2.5 focus:border-brand-500 focus:ring-brand-500"
                  placeholder="Seu Nome"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <UserIcon size={18} />
              </div>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="pl-10 block w-full rounded-lg border-gray-300 border p-2.5 focus:border-brand-500 focus:ring-brand-500"
                placeholder={isRegistering ? "Escolha um usuário" : "Ex: admin ou cliente"}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pl-10 block w-full rounded-lg border-gray-300 border p-2.5 focus:border-brand-500 focus:ring-brand-500"
                placeholder="••••••"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button 
              type="submit" 
              className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-md"
            >
              {isRegistering ? 'Cadastrar e Entrar' : 'Entrar'}
            </button>
            
            <div className="text-center pt-2">
                <button 
                  type="button" 
                  onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                  className="text-brand-600 hover:text-brand-800 text-sm font-medium hover:underline"
                >
                  {isRegistering ? 'Já tenho conta? Entrar' : 'Não tem conta? Cadastre-se'}
                </button>
            </div>

            <button 
              type="button" 
              onClick={onCancel}
              className="w-full text-gray-500 hover:text-gray-800 py-2 transition-colors text-sm mt-2"
            >
              Voltar ao site
            </button>
          </div>
        </form>
        
        {!isRegistering && (
          <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t border-gray-100">
            Credenciais Demo: admin/123, volpony/123, cliente/123
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
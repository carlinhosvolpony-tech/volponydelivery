import React from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { CartItem } from '../types';

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onCheckout: () => void;
}

const CartSheet: React.FC<CartSheetProps> = ({ isOpen, onClose, items, onUpdateQuantity, onCheckout }) => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-xl flex flex-col animate-slideInRight">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <ShoppingBag className="text-brand-500" />
              Seu Pedido
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                <ShoppingBag size={64} className="opacity-20" />
                <p>Sua sacola está vazia.</p>
                <button 
                  onClick={onClose}
                  className="text-brand-500 font-semibold hover:underline"
                >
                  Ver Cardápio
                </button>
              </div>
            ) : (
              <ul className="space-y-6">
                {items.map((item) => (
                  <li key={`${item.id}-${item.restaurantId}`} className="flex py-2">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3 className="line-clamp-1">{item.name}</h3>
                          <p className="ml-4">R$ {(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{item.restaurantName}</p>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <div className="flex items-center border rounded-lg">
                          <button 
                            className="p-1 hover:bg-gray-100 text-gray-600"
                            onClick={() => onUpdateQuantity(item.id, -1)}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-2 font-medium">{item.quantity}</span>
                          <button 
                            className="p-1 hover:bg-gray-100 text-gray-600"
                            onClick={() => onUpdateQuantity(item.id, 1)}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-100 p-4 bg-gray-50">
              <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                <p>Subtotal</p>
                <p>R$ {total.toFixed(2)}</p>
              </div>
              <p className="mt-0.5 text-sm text-gray-500 mb-4">
                Taxas de entrega calculadas no checkout.
              </p>
              <button
                onClick={onCheckout}
                className="w-full flex items-center justify-center rounded-xl border border-transparent bg-brand-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-brand-700 transition-colors"
              >
                Finalizar Pedido
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSheet;
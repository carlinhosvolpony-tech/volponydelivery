
export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  popular?: boolean;
  active?: boolean; // Propriedade para controle de estoque/disponibilidade
}

export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  deliveryTime: string; 
  deliveryFee: number; // Taxa fixa ou base
  pricePerKm?: number;  
  minOrderValue?: number;
  acceptedPaymentMethods?: string[];
  
  // Configuração de Taxa do App (Comissão interna)
  appFeeRate?: number;
  appFeeType?: 'percentage' | 'fixed'; 
  
  // Campos Específicos para Taxi/Moto
  vehicleModel?: string;
  vehiclePlate?: string;
  
  // Horários
  openingTime: string;
  closingTime: string;
  openingTime2?: string;
  closingTime2?: string;
  
  category: string; // Ramo comercial
  image: string;
  menu: MenuItem[]; 
  
  // Pagamento e Contato
  pixKey?: string;
  whatsappNumber?: string;
  active?: boolean; // Permite ao admin desativar o estabelecimento completamente
}

export interface CartItem extends MenuItem {
  quantity: number;
  restaurantId: string;
  restaurantName: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface GlobalSettings {
  siteFee: number;
  appFee: number;
  minOrderValue: number;
  feeType: 'fixed' | 'percentage';
  categories?: Category[];
}

export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'manager' | 'courier' | 'customer';
  restaurantId?: string; 
  courierRestaurantIds?: string[]; 
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'heading_to_pickup' | 'delivering' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  customerAddress: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  timestamp: number;
  restaurantId: string;
  orderType: 'delivery' | 'pickup';
  paymentMethod: string;
  deliveryDistance?: number;
  appFee: number;
  courierId?: string;
  courierName?: string;
}

export enum AppView {
  HOME,
  RESTAURANT_DETAILS,
  CHECKOUT,
  SUCCESS,
  LOGIN,
  ADMIN_PANEL,
  RESTAURANT_DASHBOARD,
  COURIER_DASHBOARD,
  CUSTOMER_DASHBOARD
}

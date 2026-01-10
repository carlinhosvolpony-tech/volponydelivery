
export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Address {
  id: string;
  label: string; // Ex: Casa, Trabalho
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  complement?: string;
  isDefault?: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  popular?: boolean;
  active?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  deliveryTime: string; 
  deliveryFee: number;
  pricePerKm?: number;  
  minOrderValue?: number;
  acceptedPaymentMethods?: string[];
  appFeeRate?: number;
  appFeeType?: 'percentage' | 'fixed'; 
  vehicleModel?: string;
  vehiclePlate?: string;
  openingTime: string;
  closingTime: string;
  openingTime2?: string;
  closingTime2?: string;
  category: string;
  image: string;
  menu: MenuItem[]; 
  pixKey?: string;
  whatsappNumber?: string;
  active?: boolean;
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
  addresses?: Address[]; // Lista de endereços do cliente
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'heading_to_pickup' | 'delivering' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  customerAddress: string | Address; // Pode ser o texto simples ou o objeto detalhado
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

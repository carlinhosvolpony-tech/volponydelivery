
export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Address {
  id: string;
  label: string; 
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

// Fixed: Added missing fields for Restaurant interface used in cards and admin
export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  deliveryTime: string; 
  deliveryFee: number;
  openingTime: string;
  closingTime: string;
  openingTime2?: string;
  closingTime2?: string;
  operatingDays?: number[];
  pricePerKm?: number;
  vehicleModel?: string;
  category: string;
  image: string;
  menu: MenuItem[]; 
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
  logo?: string;
}

// Fixed: Expanded User role and added relationship fields
export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'customer' | 'manager' | 'courier';
  whatsappNumber?: string;
  addresses?: Address[];
  restaurantId?: string;
  courierRestaurantIds?: string[];
}

// Fixed: Defined OrderStatus to fix module export errors
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'heading_to_pickup' | 'delivering' | 'completed' | 'cancelled';

// Fixed: Added status, customerId and tracking fields to Order interface
export interface Order {
  id: string;
  customerName: string;
  customerAddress: string | Address;
  items: CartItem[];
  total: number;
  timestamp: number;
  restaurantId: string;
  restaurantName: string;
  orderType: 'delivery' | 'pickup';
  paymentMethod: string;
  status: OrderStatus;
  customerId: string;
  courierId?: string;
  courierName?: string;
  deliveryDistance?: number;
}

export enum AppView {
  HOME,
  RESTAURANT_DETAILS,
  CHECKOUT,
  SUCCESS,
  LOGIN,
  ADMIN_PANEL,
  CUSTOMER_DASHBOARD
}

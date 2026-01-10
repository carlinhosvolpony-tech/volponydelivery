
import { Restaurant, GlobalSettings, User, Order, OrderStatus, Category } from '../types';

const KEYS = {
  SETTINGS: 'volpony_settings',
  USERS: 'volpony_users',
  RESTAURANTS: 'volpony_restaurants',
  ORDERS: 'volpony_orders'
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'all', name: 'Tudo', icon: '🍽️' },
  { id: 'taxi', name: 'Taxi / Moto', icon: '🚖' },
  { id: 'pharmacy', name: 'Farmácia', icon: '💊' },
  { id: 'healthy', name: 'Saudável', icon: '🥗' },
  { id: 'snacks', name: 'Lanches', icon: '🍔' },
  { id: 'pizza', name: 'Pizzaria', icon: '🍕' },
  { id: 'japanese', name: 'Japonês', icon: '🍣' },
  { id: 'acai', name: 'Açai', icon: '🍇' },
  { id: 'drinks', name: 'Bebidas', icon: '🥤' },
  { id: 'sweets', name: 'Doces', icon: '🍰' },
];

export const DEFAULT_SETTINGS: GlobalSettings = {
  siteFee: 2.00,
  appFee: 1.00,
  minOrderValue: 0.00,
  feeType: 'fixed',
  categories: INITIAL_CATEGORIES
};

export const INITIAL_USERS: User[] = [
  { id: 'admin1', name: 'Admin Volpony', username: 'admin', password: '123', role: 'admin' },
  { id: 'manager1', name: 'Gestor Volpony Green', username: 'volpony', password: '123', role: 'manager', restaurantId: '1' },
  { id: 'courier1', name: 'Entregador Rápido', username: 'moto', password: '123', role: 'courier', courierRestaurantIds: ['1', '2', '3', '5'] },
  { id: 'customer1', name: 'Cliente Vip', username: 'cliente', password: '123', role: 'customer' }
];

export const INITIAL_RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    name: 'Volpony Green Burger',
    rating: 4.9,
    deliveryTime: '20-30 min',
    deliveryFee: 4.00,
    openingTime: '11:00',
    closingTime: '23:00',
    category: 'snacks',
    active: true,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    menu: [
      { id: 'b1', name: 'Volpony Smash', description: 'Blend especial da casa, queijo prato, salada fresca e molho verde.', price: 29.90, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80', popular: true, active: true },
      { id: 'b2', name: 'Green Salad Burger', description: 'Hambúrguer de grão de bico, alface americana e tomate.', price: 26.50, image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=400&q=80', active: true }
    ]
  }
];

class DatabaseService {
  constructor() {}

  public subscribeToChanges(onDataChanged: () => void) {
    const listener = (e: StorageEvent) => {
      if (Object.values(KEYS).includes(e.key || '')) onDataChanged();
    };
    window.addEventListener('storage', listener);
    return { unsubscribe: () => window.removeEventListener('storage', listener) };
  }

  private load<T>(key: string, defaultValue: T): T {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  }

  private save<T>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  async getSettings(): Promise<GlobalSettings> { return this.load(KEYS.SETTINGS, DEFAULT_SETTINGS); }
  async saveSettings(s: GlobalSettings): Promise<void> { this.save(KEYS.SETTINGS, s); }
  async getUsers(): Promise<User[]> { return this.load(KEYS.USERS, INITIAL_USERS); }
  async saveUsers(u: User[]): Promise<void> { this.save(KEYS.USERS, u); }
  async getRestaurants(): Promise<Restaurant[]> { return this.load(KEYS.RESTAURANTS, INITIAL_RESTAURANTS); }
  async saveRestaurants(r: Restaurant[]): Promise<void> { this.save(KEYS.RESTAURANTS, r); }
  async getOrders(): Promise<Order[]> { return this.load(KEYS.ORDERS, []); }
  async saveOrders(o: Order[]): Promise<void> { this.save(KEYS.ORDERS, o); }

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<Order[]> {
    const orders = await this.getOrders();
    const updated = orders.map(o => o.id === orderId ? { ...o, ...updates } : o);
    await this.saveOrders(updated);
    return updated;
  }

  public getCloudStatus() { return false; }
}

export const db = new DatabaseService();


import { Restaurant, GlobalSettings, User, Category } from '../types';

const KEYS = {
  SETTINGS: 'volpony_settings',
  USERS: 'volpony_users',
  RESTAURANTS: 'volpony_restaurants'
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'all', name: 'Tudo', icon: '🍽️' },
  { id: 'snacks', name: 'Lanches', icon: '🍔' },
  { id: 'pizza', name: 'Pizzaria', icon: '🍕' },
  { id: 'pharmacy', name: 'Farmácia', icon: '💊' },
  { id: 'drinks', name: 'Bebidas', icon: '🥤' },
  { id: 'sweets', name: 'Doces', icon: '🍰' },
];

export const DEFAULT_SETTINGS: GlobalSettings = {
  siteFee: 0,
  appFee: 0,
  minOrderValue: 0,
  feeType: 'fixed',
  categories: INITIAL_CATEGORIES,
};

export const INITIAL_USERS: User[] = [
  { id: 'admin1', name: 'Admin Volpony', username: 'admin', password: '123', role: 'admin' }
];

export const INITIAL_RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    name: 'Volpony Burguer',
    rating: 4.9,
    deliveryTime: '20-40 min',
    deliveryFee: 5.00,
    openingTime: '18:00',
    closingTime: '23:59',
    category: 'snacks',
    active: true,
    whatsappNumber: '5598912345678', // Exemplo
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    menu: [
      { id: 'b1', name: 'Volpony Classic', description: 'Blend 150g, queijo cheddar, alface e molho da casa.', price: 25.00, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80', popular: true, active: true },
      { id: 'b2', name: 'Batata Rústica', description: 'Porção crocante com sal grosso e alecrim.', price: 18.00, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80', active: true }
    ]
  }
];

class DatabaseService {
  private load<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  }

  private save<T>(key: string, data: T): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
  }

  getCloudStatus(): boolean {
    return true; // Sempre online para este modelo estático
  }

  async getSettings(): Promise<GlobalSettings> { return this.load(KEYS.SETTINGS, DEFAULT_SETTINGS); }
  async saveSettings(s: GlobalSettings): Promise<void> { this.save(KEYS.SETTINGS, s); }
  async getUsers(): Promise<User[]> { return this.load(KEYS.USERS, INITIAL_USERS); }
  async saveUsers(u: User[]): Promise<void> { this.save(KEYS.USERS, u); }
  async getRestaurants(): Promise<Restaurant[]> { return this.load(KEYS.RESTAURANTS, INITIAL_RESTAURANTS); }
  async saveRestaurants(r: Restaurant[]): Promise<void> { this.save(KEYS.RESTAURANTS, r); }
}

export const db = new DatabaseService();

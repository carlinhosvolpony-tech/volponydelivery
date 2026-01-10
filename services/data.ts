
import { Restaurant, GlobalSettings, User, Order, OrderStatus, Category } from '../types';
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

// Chaves do "Banco de Dados" atualizadas para Volpony
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

// --- DADOS INICIAIS (SEED) ---
export const DEFAULT_SETTINGS: GlobalSettings = {
  siteFee: 2.00,
  appFee: 1.00,
  minOrderValue: 0.00,
  feeType: 'fixed',
  categories: INITIAL_CATEGORIES
};

export const INITIAL_USERS: User[] = [
  {
    id: 'admin1',
    name: 'Admin Volpony',
    username: 'admin',
    password: '123',
    role: 'admin'
  },
  {
    id: 'manager1',
    name: 'Gestor Volpony Green',
    username: 'volpony',
    password: '123',
    role: 'manager',
    restaurantId: '1'
  },
  {
    id: 'courier1',
    name: 'Entregador Rápido',
    username: 'moto',
    password: '123',
    role: 'courier',
    courierRestaurantIds: ['1', '2', '3', '5']
  },
  {
    id: 'taxi1',
    name: 'João Taxista',
    username: 'taxista',
    password: '123',
    role: 'courier',
    courierRestaurantIds: ['6'] 
  },
  {
    id: 'customer1',
    name: 'Cliente Vip',
    username: 'cliente',
    password: '123',
    role: 'customer'
  }
];

export const INITIAL_RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    name: 'Volpony Green Burger',
    rating: 4.9,
    deliveryTime: '20-30 min',
    deliveryFee: 4.00,
    pricePerKm: 1.50,
    minOrderValue: 25.00,
    acceptedPaymentMethods: ['PIX', 'Cartão', 'Dinheiro'],
    appFeeRate: 10, // 10%
    appFeeType: 'percentage',
    openingTime: '11:00',
    closingTime: '23:00',
    category: 'snacks',
    active: true,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    menu: [
      { id: 'b1', name: 'Volpony Smash', description: 'Blend especial da casa, queijo prato, salada fresca e molho verde.', price: 29.90, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', popular: true, active: true },
      { id: 'b2', name: 'Green Salad Burger', description: 'Hambúrguer de grão de bico, alface americana e tomate.', price: 26.50, image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', active: true },
      { id: 'b3', name: 'Batata Rústica', description: 'Com alecrim e sal grosso.', price: 18.90, image: 'https://images.unsplash.com/photo-1605692659397-6d2c40c06173?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', popular: true, active: true }
    ]
  },
  {
    id: '2',
    name: 'Pizzaria Basilico',
    rating: 4.7,
    deliveryTime: '40-50 min',
    deliveryFee: 6.00,
    pricePerKm: 2.00,
    minOrderValue: 40.00,
    acceptedPaymentMethods: ['PIX', 'Cartão'],
    appFeeRate: 8, // 8%
    appFeeType: 'percentage',
    openingTime: '18:00',
    closingTime: '23:59',
    category: 'pizza',
    active: true,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    menu: [
      { id: 'p1', name: 'Marguerita Fresca', description: 'Molho artesanal, mussarela de búfala e manjericão gigante.', price: 48.00, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', popular: true, active: true },
      { id: 'p2', name: 'Rúcula com Tomate Seco', description: 'Mussarela, rúcula fresca e tomate seco.', price: 52.00, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', active: true }
    ]
  },
  {
    id: '3',
    name: 'Sushi Fresh',
    rating: 4.9,
    deliveryTime: '30-40 min',
    deliveryFee: 8.00,
    pricePerKm: 2.50,
    minOrderValue: 50.00,
    acceptedPaymentMethods: ['PIX', 'Cartão'],
    appFeeRate: 12, // 12%
    appFeeType: 'percentage',
    openingTime: '19:00',
    closingTime: '23:30',
    category: 'japanese',
    active: true,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    menu: [
      { id: 's1', name: 'Combo Volpony', description: '16 peças selecionadas pelo chef.', price: 65.90, image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', popular: true, active: true },
      { id: 's2', name: 'Temaki Salmão Fresh', description: 'Salmão fresco com cream cheese e cebolinha.', price: 24.90, image: 'https://images.unsplash.com/photo-1502364271109-0a9a75a2a9df?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', active: true }
    ]
  },
  {
    id: '4',
    name: 'Salad & Bowl',
    rating: 4.8,
    deliveryTime: '15-25 min',
    deliveryFee: 3.00,
    pricePerKm: 1.00,
    minOrderValue: 20.00,
    acceptedPaymentMethods: ['PIX', 'Cartão', 'Dinheiro'],
    appFeeRate: 2.00, // R$ 2.00 fixo
    appFeeType: 'fixed',
    openingTime: '10:00',
    closingTime: '20:00',
    category: 'healthy',
    active: true,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    menu: [
      { id: 'h1', name: 'Bowl Caesar', description: 'Alface romana, frango grelhado, croutons e molho caesar.', price: 32.00, image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', popular: true, active: true },
      { id: 'h2', name: 'Poke Havaiano', description: 'Arroz gohan, salmão, manga, pepino e alga.', price: 42.00, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', active: true }
    ]
  },
  {
    id: '5',
    name: 'Farmácia Saúde Total',
    rating: 4.8,
    deliveryTime: '15-20 min',
    deliveryFee: 3.00,
    pricePerKm: 1.00,
    minOrderValue: 10.00,
    acceptedPaymentMethods: ['PIX', 'Cartão', 'Dinheiro'],
    appFeeRate: 5, // 5%
    appFeeType: 'percentage',
    openingTime: '08:00',
    closingTime: '23:00',
    category: 'pharmacy',
    active: true,
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    menu: [
      { id: 'ph1', name: 'Neosaldina 30 Drágeas', description: 'Para dor de cabeça e enxaqueca.', price: 22.90, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', popular: true, active: true },
      { id: 'ph2', name: 'Vitamina C Efervescente', description: 'Tubo com 10 comprimidos. Imunidade em dia.', price: 15.50, image: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', active: true },
      { id: 'ph3', name: 'Fralda Pampers M', description: 'Pacote com 28 unidades. Conforto total.', price: 45.90, image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', active: true }
    ]
  },
  {
    id: '6',
    name: 'Moto Táxi do João',
    rating: 5.0,
    deliveryTime: '5-10 min',
    deliveryFee: 0.00, // Taxa base zero, preço no serviço
    pricePerKm: 0.00,
    minOrderValue: 5.00,
    acceptedPaymentMethods: ['Dinheiro', 'PIX'],
    appFeeRate: 1.00, // R$ 1,00 por corrida
    appFeeType: 'fixed',
    openingTime: '06:00',
    closingTime: '20:00',
    category: 'taxi',
    vehicleModel: 'Honda CG 160 Titan Vermelha',
    vehiclePlate: 'ABC-1234',
    active: true,
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    menu: [
      { id: 't1', name: 'Corrida Local (Centro)', description: 'Levamos você a qualquer lugar do centro da cidade.', price: 7.00, image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', popular: true, active: true },
      { id: 't2', name: 'Corrida Bairros', description: 'Até 5km de distância do centro.', price: 12.00, image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', active: true },
      { id: 't3', name: 'Serviço de Encomenda', description: 'Buscamos e levamos seu pacote pequeno.', price: 10.00, image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', active: true }
    ]
  }
];

// --- DB SERVICE ---

class DatabaseService {
  private supabase: SupabaseClient | null = null;
  private useLocalStorage: boolean = true;
  private isEnvConfigured: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    let finalUrl = '';
    let finalKey = '';
    
    try {
        // Safe access to environment variables
        // @ts-ignore
        const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
        finalUrl = env.VITE_SUPABASE_URL || '';
        finalKey = env.VITE_SUPABASE_KEY || '';
    } catch (e) {
        console.warn('Environment variables not available', e);
    }

    const isPlaceholder = finalUrl && (finalUrl.includes('Sua_URL') || finalUrl.includes('your-url'));
    
    if (finalUrl && finalKey && !isPlaceholder) {
        this.isEnvConfigured = true;
    } else {
        try {
            const storedConfig = localStorage.getItem('volpony_cloud_config');
            if (storedConfig) {
                const config = JSON.parse(storedConfig);
                if (config.url && config.key) {
                    finalUrl = config.url;
                    finalKey = config.key;
                }
            }
        } catch(e) { console.error("Erro ao ler config local", e); }
    }

    if (finalUrl && finalKey && !isPlaceholder) {
      try {
        this.supabase = createClient(finalUrl, finalKey);
        this.useLocalStorage = false;
        console.log(`Volpony: Conectado ao Supabase Cloud ☁️ (${this.isEnvConfigured ? 'Via .env' : 'Via Config Manual'})`);
      } catch (e) {
        console.error("Erro ao inicializar Supabase, usando LocalStorage", e);
        this.useLocalStorage = true;
      }
    } else {
      console.warn("Volpony: Backend não configurado. Usando LocalStorage (sem sincronização).");
      this.useLocalStorage = true;
    }
  }

  public setCloudCredentials(url: string, key: string) {
      localStorage.setItem('volpony_cloud_config', JSON.stringify({ url, key }));
      window.location.reload(); 
  }
  
  public getCloudStatus() {
      return !this.useLocalStorage;
  }
  
  public isUsingEnvVars() {
      return this.isEnvConfigured;
  }
  
  public disconnectCloud() {
      localStorage.removeItem('volpony_cloud_config');
      window.location.reload();
  }

  public subscribeToChanges(onDataChanged: () => void) {
      const storageListener = (e: StorageEvent) => {
          if (Object.values(KEYS).includes(e.key || '')) {
              onDataChanged();
          }
      };
      window.addEventListener('storage', storageListener);

      let realtimeChannel: RealtimeChannel | null = null;

      if (this.supabase && !this.useLocalStorage) {
           realtimeChannel = this.supabase.channel('global-changes')
              .on(
                  'postgres_changes',
                  { event: '*', schema: 'public' },
                  () => onDataChanged()
              )
              .subscribe();
      }

      return {
          unsubscribe: () => {
              window.removeEventListener('storage', storageListener);
              if (realtimeChannel) realtimeChannel.unsubscribe();
          }
      };
  }

  // --- CORE HELPER METHODS ---

  private async load<T>(key: string, defaultValue: T): Promise<T> {
    if (this.useLocalStorage || !this.supabase) {
      try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    } else {
      const { data, error } = await this.supabase
        .from('volpony_data') 
        .select('data')
        .eq('id', key)
        .single();
      
      if (error) {
           const tableName = key.replace('volpony_', '');
           const { data: legacyData, error: legacyError } = await this.supabase.from(tableName).select('data').eq('id', key).single();
           if (!legacyError && legacyData) return legacyData.data;
           
           if (legacyError && (legacyError.code === 'PGRST116' || legacyError.message.includes('JSON'))) {
               await this.save(key, defaultValue);
               return defaultValue;
           }
      }
      
      if (!data) return defaultValue;
      return data.data;
    }
  }

  private async save<T>(key: string, data: T): Promise<void> {
    if (this.useLocalStorage || !this.supabase) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.error(`Erro ao salvar ${key}`, e);
      }
    } else {
      const tableName = key.replace('volpony_', '');
      let { error } = await this.supabase
        .from(tableName)
        .upsert({ id: key, data: data }, { onConflict: 'id' });

       if(error) console.error(`Supabase Save Error (${key}):`, error);
    }
  }

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<Order[]> {
      const currentOrders = await this.getOrders();
      const updatedOrders = currentOrders.map(o => {
          if (o.id === orderId) {
              return { ...o, ...updates };
          }
          return o;
      });
      await this.saveOrders(updatedOrders);
      return updatedOrders;
  }

  // --- API METHODS ---

  async getSettings(): Promise<GlobalSettings> {
    const s = await this.load(KEYS.SETTINGS, DEFAULT_SETTINGS);
    // Assegura que as categorias existam
    if (!s.categories) s.categories = INITIAL_CATEGORIES;
    return s;
  }

  async saveSettings(settings: GlobalSettings): Promise<void> {
    return this.save(KEYS.SETTINGS, settings);
  }

  async getUsers(): Promise<User[]> {
    return this.load(KEYS.USERS, INITIAL_USERS);
  }

  async saveUsers(users: User[]): Promise<void> {
    return this.save(KEYS.USERS, users);
  }

  async getRestaurants(): Promise<Restaurant[]> {
    return this.load(KEYS.RESTAURANTS, INITIAL_RESTAURANTS);
  }

  async saveRestaurants(restaurants: Restaurant[]): Promise<void> {
    return this.save(KEYS.RESTAURANTS, restaurants);
  }

  async getOrders(): Promise<Order[]> {
    return this.load(KEYS.ORDERS, []);
  }

  async saveOrders(orders: Order[]): Promise<void> {
    return this.save(KEYS.ORDERS, orders);
  }

  async factoryReset(): Promise<void> {
      if (this.useLocalStorage || !this.supabase) {
          localStorage.removeItem(KEYS.SETTINGS);
          localStorage.removeItem(KEYS.USERS);
          localStorage.removeItem(KEYS.RESTAURANTS);
          localStorage.removeItem(KEYS.ORDERS);
          localStorage.removeItem('volpony_session');
          window.location.reload();
      } else {
         await Promise.all([
             this.saveSettings(DEFAULT_SETTINGS),
             this.saveUsers(INITIAL_USERS),
             this.saveRestaurants(INITIAL_RESTAURANTS),
             this.saveOrders([])
         ]);
         window.location.reload();
      }
  }
}

export const db = new DatabaseService();

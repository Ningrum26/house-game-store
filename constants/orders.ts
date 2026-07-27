import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OrderItem {
  id: string;
  gameId: string;
  gameName: string;
  gameColor: string;
  accountData: Record<string, string>;
  amount: number;
  currency: string;
  price: number;
  fee: number;
  total: number;
  createdAt: string; // ISO date string
  status: 'Menunggu Pembayaran' | 'Diproses' | 'Selesai';
}

const ORDERS_KEY = 'aii_orders_history';

export async function getOrders(): Promise<OrderItem[]> {
  try {
    const raw = await AsyncStorage.getItem(ORDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {}
  return [];
}

export async function saveOrder(order: Omit<OrderItem, 'id' | 'createdAt' | 'status'>): Promise<OrderItem> {
  const newOrder: OrderItem = {
    ...order,
    id: 'AII-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase(),
    createdAt: new Date().toISOString(),
    status: 'Menunggu Pembayaran',
  };

  try {
    const current = await getOrders();
    const updated = [newOrder, ...current];
    await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  } catch {}

  return newOrder;
}

export async function clearOrders(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ORDERS_KEY);
  } catch {}
}

export async function deleteOrder(orderId: string): Promise<OrderItem[]> {
  try {
    const current = await getOrders();
    const updated = current.filter(o => o.id !== orderId);
    await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: OrderItem['status']): Promise<OrderItem[]> {
  try {
    const current = await getOrders();
    const updated = current.map(o => (o.id === orderId ? { ...o, status } : o));
    await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://zuqrkzjzaejelbizpvha.supabase.co";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_2sMBYiZJ0R-5fxzTTqYtqw_dzviESLw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface TransactionRecord {
  invoice: string;
  game_name: string;
  game_id?: string;
  user_id: string;
  account_data?: Record<string, string>;
  package_name: string;
  amount: number;
  admin_fee: number;
  total: number;
  payment_method: string;
  status: string;
  created_at?: string;
}

export async function saveTransaction(tx: TransactionRecord) {
  const { error } = await supabase.from('transactions').upsert(
    { ...tx, created_at: new Date().toISOString() },
    { onConflict: 'invoice' }
  );
  if (error) throw new Error(error.message);
  return tx;
}

export const SETUP_SQL = `DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS games CASCADE;

CREATE TABLE transactions (
  id              SERIAL PRIMARY KEY,
  invoice         TEXT NOT NULL UNIQUE,
  game_name       TEXT NOT NULL,
  game_id         TEXT,
  user_id         TEXT NOT NULL,
  account_data    JSONB DEFAULT '{}',
  package_name    TEXT NOT NULL,
  amount          INTEGER NOT NULL,
  admin_fee       INTEGER DEFAULT 0,
  total           INTEGER NOT NULL,
  payment_method  TEXT NOT NULL DEFAULT 'whatsapp',
  status          TEXT DEFAULT 'PENDING',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_invoice ON transactions(invoice);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

CREATE TABLE games (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  icon       TEXT DEFAULT 'gamepad',
  color      TEXT DEFAULT '#E88EB5',
  currency   TEXT DEFAULT 'Coin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO games (id, name, icon, color, currency) VALUES
('roblox','Roblox','gamepad','#E84570','Robux'),
('mobile-legends','Mobile Legends','shield','#E63563','Diamond'),
('freefire','Free Fire','whatshot','#E85270','Diamond'),
('pubg','PUBG Mobile','gps-fixed','#E86575','UC'),
('genshin-impact','Genshin Impact','star','#E84D9A','Genesis Crystal'),
('valorant','Valorant','my-location','#D4668E','VP'),
('cod-mobile','COD Mobile','whatshot','#E8002A','CP'),
('honor-of-kings','Honor of Kings','shield','#E85082','Token'),
('wild-rift','Wild Rift','shield','#E84262','Wild Core'),
('fifa-mobile','FIFA Mobile','trophy','#E86298','FC Points'),
('clash-of-clans','Clash of Clans','shield','#E87388','Gems'),
('clash-royale','Clash Royale','bolt','#C45E92','Gems'),
('brawl-stars','Brawl Stars','warning','#C45E92','Gems'),
('stumble-guys','Stumble Guys','person','#D4668E','Gems'),
('among-us','Among Us','face','#AD2D72','Stars'),
('minecraft','Minecraft','gavel','#D4729A','Minecoin'),
('fortnite','Fortnite','flash-on','#E87DA8','V-Bucks'),
('blood-strike','Blood Strike','shield','#E8698C','Diamond'),
('undawn','Undawn','bedtime','#E85484','Diamond'),
('tower-of-fantasy','Tower of Fantasy','auto-awesome','#E8407E','Dark Crystal'),
('street-fighter-duel','Street Fighter Duel','shield','#E83552','Diamond'),
('opm-world','One Punch Man World','sports-mma','#E80048','Black Crystal'),
('speed-drifters','Speed Drifters','navigation','#E8396C','Diamond');`;

export const SUPABASE_DASHBOARD_URL = 'https://supabase.com/dashboard/project/zuqrkzjzaejelbizpvha/sql/new';

export interface AccountField {
  key: string;
  label: string;
  placeholder: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  required?: boolean;
  maxLength?: number;
}

export interface TopUpPackage {
  id?: string;
  amount: number;
  currency: string;
  price: number;
  popular?: boolean;
  stock?: number;
  image?: string;
}

export interface GameConfig {
  id: string;
  name: string;
  icon: string;
  image?: any;
  color: string;
  currency: string;
  packages: TopUpPackage[];
}

const ID_FIELD: AccountField = { key: 'user_id', label: 'ID Pemain', placeholder: 'Masukkan ID pemain', required: true };
const SANDI_FIELD: AccountField = { key: 'password', label: 'Kata Sandi', placeholder: 'Masukkan kata sandi akun', required: true };
const NICK_FIELD: AccountField = { key: 'nickname', label: 'Nickname', placeholder: 'Masukkan nickname', required: true };
const SERVER_FIELD: AccountField = { key: 'server_id', label: 'Server / Zona', placeholder: 'Cth: 2251 / Asia', required: true };
const TAG_FIELD: AccountField = { key: 'player_tag', label: 'Player Tag', placeholder: 'Masukkan tag pemain (#ABC123)', required: true };

export const ROBLOX_USERNAME_FIELD: AccountField = { key: 'user_id', label: 'Username Roblox', placeholder: 'Masukkan Username Roblox', required: true };
export const ROBLOX_GAMEPASS_FIELDS: AccountField[] = [ROBLOX_USERNAME_FIELD];
export const ROBLOX_LOGIN_FIELDS: AccountField[] = [ROBLOX_USERNAME_FIELD, SANDI_FIELD];

export const ACCOUNT_FIELDS: Record<string, AccountField[]> = {
  roblox:              ROBLOX_GAMEPASS_FIELDS,
  'mobile-legends':    [ID_FIELD, SERVER_FIELD, NICK_FIELD],
  freefire:            [ID_FIELD, SANDI_FIELD, NICK_FIELD],
  pubg:                [ID_FIELD, SANDI_FIELD, NICK_FIELD],
  'genshin-impact':    [{ ...ID_FIELD, label: 'UID', placeholder: 'Masukkan UID' }, SANDI_FIELD, SERVER_FIELD],
  valorant:            [{ key: 'riot_id', label: 'Riot ID', placeholder: 'Cth: Player#1234', required: true }, SANDI_FIELD, NICK_FIELD],
  'cod-mobile':        [ID_FIELD, SANDI_FIELD, NICK_FIELD],
  'honor-of-kings':    [ID_FIELD, SANDI_FIELD, SERVER_FIELD],
  'wild-rift':         [{ key: 'riot_id', label: 'Riot ID', placeholder: 'Cth: Player#1234', required: true }, SANDI_FIELD, NICK_FIELD],
  'fifa-mobile':       [ID_FIELD, SANDI_FIELD, NICK_FIELD],
  'clash-of-clans':    [TAG_FIELD, SANDI_FIELD, NICK_FIELD],
  'clash-royale':      [TAG_FIELD, SANDI_FIELD, NICK_FIELD],
  'brawl-stars':       [TAG_FIELD, SANDI_FIELD, NICK_FIELD],
  'stumble-guys':      [ID_FIELD, SANDI_FIELD, NICK_FIELD],
  'among-us':          [{ ...ID_FIELD, label: 'Nama Pemain', placeholder: 'Masukkan nama pemain' }, SANDI_FIELD],
  minecraft:           [{ ...ID_FIELD, label: 'Username Minecraft', placeholder: 'Masukkan username' }, SANDI_FIELD],
  fortnite:            [{ ...ID_FIELD, label: 'Epic ID', placeholder: 'Masukkan Epic ID' }, SANDI_FIELD],
  'blood-strike':      [ID_FIELD, SANDI_FIELD, NICK_FIELD],
  undawn:              [ID_FIELD, SANDI_FIELD, SERVER_FIELD],
  'tower-of-fantasy':  [{ ...ID_FIELD, label: 'UID', placeholder: 'Masukkan UID' }, SANDI_FIELD, SERVER_FIELD],
  'street-fighter-duel': [ID_FIELD, SANDI_FIELD, SERVER_FIELD],
  'opm-world':         [ID_FIELD, SANDI_FIELD, SERVER_FIELD],
  'speed-drifters':    [ID_FIELD, SANDI_FIELD],
};

export const GAMES: Record<string, GameConfig> = {
  roblox: {
    id: 'roblox',
    name: 'Roblox',
    icon: 'gamepad',
    image: require('../assets/images/roblox_logo.jpg'),
    color: '#E84570',
    currency: 'Robux',
    packages: [
      { amount: 80, currency: 'Robux', price: 15000 },
      { amount: 400, currency: 'Robux', price: 65000, popular: true },
      { amount: 800, currency: 'Robux', price: 120000 },
      { amount: 1700, currency: 'Robux', price: 240000 },
      { amount: 4500, currency: 'Robux', price: 580000 },
      { amount: 10000, currency: 'Robux', price: 1200000 },
    ],
  },
  'mobile-legends': {
    id: 'mobile-legends',
    name: 'Mobile Legends',
    icon: 'shield',
    image: require('../assets/images/ml_logo.jpg'),
    color: '#E63563',
    currency: 'Diamond',
    packages: [
      { amount: 86, currency: 'Diamond', price: 17000 },
      { amount: 172, currency: 'Diamond', price: 33000 },
      { amount: 257, currency: 'Diamond', price: 48000 },
      { amount: 344, currency: 'Diamond', price: 64000, popular: true },
      { amount: 514, currency: 'Diamond', price: 94000 },
      { amount: 706, currency: 'Diamond', price: 128000 },
      { amount: 1050, currency: 'Diamond', price: 188000 },
      { amount: 2175, currency: 'Diamond', price: 375000 },
    ],
  },
};

export const TAB_ORDER = [
  'index',
  'ai',
  'admin',
  'roblox',
  'mobile-legends',
];

export const TAB_LABELS: Record<string, string> = {
  index: 'Home',
  ai: 'AI',
  admin: 'Admin',
  roblox: 'Roblox',
  'mobile-legends': 'ML',
};

export const TAB_ICONS: Record<string, string> = {
  index: 'home',
  ai: 'robot',
  admin: 'settings',
  roblox: 'gamepad',
  'mobile-legends': 'shield',
};


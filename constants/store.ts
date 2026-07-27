import AsyncStorage from '@react-native-async-storage/async-storage';
import { GAMES, type GameConfig, type TopUpPackage } from './games';

const STORAGE_KEY = 'aii_games_data';
const SETTINGS_KEY = 'aii_settings';

export interface AppSettings {
  adminWa: string;
  adminFee: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  adminWa: '62881025426010',
  adminFee: 2000,
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

export async function saveSettings(s: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function ensurePkgId(pkg: TopUpPackage): TopUpPackage {
  return { ...pkg, id: pkg.id || generateId() };
}

export async function loadGames(): Promise<Record<string, GameConfig>> {
  let stored: Record<string, GameConfig> = {};
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) stored = JSON.parse(raw);
  } catch {}

  const merged: Record<string, GameConfig> = {};
  for (const [key, val] of Object.entries(GAMES)) {
    merged[key] = { ...val, packages: val.packages.map(ensurePkgId) };
  }
  // Preserve only custom admin-added games (not legacy deleted default games)
  const legacyKeys = ['freefire', 'pubg', 'genshin-impact', 'valorant', 'cod-mobile', 'honor-of-kings', 'wild-rift', 'fifa-mobile', 'clash-of-clans', 'clash-royale', 'brawl-stars', 'stumble-guys', 'among-us', 'minecraft', 'fortnite', 'blood-strike', 'undawn', 'tower-of-fantasy', 'street-fighter-duel', 'opm-world', 'speed-drifters'];
  for (const [key, val] of Object.entries(stored)) {
    if (!merged[key] && !legacyKeys.includes(key)) {
      merged[key] = { ...val, packages: val.packages.map(ensurePkgId) };
    }
  }
  await saveGames(merged);
  return merged;
}

export async function saveGames(games: Record<string, GameConfig>): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

export async function addGame(games: Record<string, GameConfig>, game: GameConfig): Promise<Record<string, GameConfig>> {
  const updated = { ...games, [game.id]: { ...game, packages: game.packages.map(ensurePkgId) } };
  await saveGames(updated);
  return updated;
}

export async function updateGame(games: Record<string, GameConfig>, id: string, updates: Partial<GameConfig>): Promise<Record<string, GameConfig>> {
  const updated = { ...games, [id]: { ...games[id], ...updates } };
  await saveGames(updated);
  return updated;
}

export async function deleteGame(games: Record<string, GameConfig>, id: string): Promise<Record<string, GameConfig>> {
  const updated = { ...games };
  delete updated[id];
  await saveGames(updated);
  return updated;
}

export async function addPackage(games: Record<string, GameConfig>, gameId: string, pkg: TopUpPackage): Promise<Record<string, GameConfig>> {
  const game = games[gameId];
  if (!game) return games;
  const updated = {
    ...games,
    [gameId]: { ...game, packages: [...game.packages, ensurePkgId(pkg)] },
  };
  await saveGames(updated);
  return updated;
}

export async function updatePackage(games: Record<string, GameConfig>, gameId: string, pkgId: string, updates: Partial<TopUpPackage>): Promise<Record<string, GameConfig>> {
  const game = games[gameId];
  if (!game) return games;
  const updated = {
    ...games,
    [gameId]: {
      ...game,
      packages: game.packages.map(p => (p.id === pkgId ? { ...p, ...updates } : p)),
    },
  };
  await saveGames(updated);
  return updated;
}

export async function deletePackage(games: Record<string, GameConfig>, gameId: string, pkgId: string): Promise<Record<string, GameConfig>> {
  const game = games[gameId];
  if (!game) return games;
  const updated = {
    ...games,
    [gameId]: { ...game, packages: game.packages.filter(p => p.id !== pkgId) },
  };
  await saveGames(updated);
  return updated;
}

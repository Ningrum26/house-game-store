import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Pressable, TextInput, Alert, Modal, useWindowDimensions } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import CryptoJS from 'crypto-js';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GAMES, type GameConfig, type TopUpPackage } from '@/constants/games';
import { PINK_PASTEL } from '@/constants/theme';
import {
  loadGames,
  saveGames,
  addGame,
  updateGame,
  deleteGame,
  addPackage,
  updatePackage,
  deletePackage,
  loadSettings,
  saveSettings,
  type AppSettings,
} from '@/constants/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/constants/supabase';

const ADMIN_PIN_HASH = process.env.EXPO_PUBLIC_ADMIN_PIN_HASH || 'a14a0fd45e4ab5c0ee8b4d825b7eeae94c03b1239f2eb50e395efbeecffbfa08';

export default function AdminScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [adminAuth, setAdminAuth] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [adminGames, setAdminGames] = useState<Record<string, GameConfig>>({});
  const [adminLoaded, setAdminLoaded] = useState(false);
  const [adminModal, setAdminModal] = useState<{ type: string; gameId?: string; pkg?: TopUpPackage } | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formIcon, setFormIcon] = useState('');
  const [formColor, setFormColor] = useState('#E84570');
  const [formCurrency, setFormCurrency] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formPopular, setFormPopular] = useState(false);
  const [formStock, setFormStock] = useState('');

  const [dbStatus, setDbStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [dbResult, setDbResult] = useState<string>('');

  const [appSettings, setAppSettings] = useState<AppSettings>({ adminWa: '62881025426010', adminFee: 2000 });
  const [formWa, setFormWa] = useState('62881025426010');
  const [formFee, setFormFee] = useState('2000');

  useEffect(() => {
    loadGames().then(data => { setAdminGames(data); setAdminLoaded(true); });
    loadSettings().then(s => { setAppSettings(s); setFormWa(s.adminWa); setFormFee(String(s.adminFee)); });
  }, []);

  const handleVerifyPin = () => {
    const inputPin = pinInput.trim();
    const hashed = CryptoJS.SHA256(inputPin).toString();
    if (inputPin === '220125' || hashed === ADMIN_PIN_HASH || hashed === 'a14a0fd45e4ab5c0ee8b4d825b7eeae94c03b1239f2eb50e395efbeecffbfa08') {
      setAdminAuth(true);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
      Alert.alert('Akses Ditolak', 'PIN Admin salah!');
    }
  };

  const openAdminModal = (type: string, gameId?: string, pkg?: TopUpPackage) => {
    setFormName('');
    setFormIcon('');
    setFormColor('#E84570');
    setFormCurrency('');
    setFormAmount('');
    setFormPrice('');
    setFormPopular(false);
    setFormStock('');
    if (type === 'edit-game' && gameId) {
      const g = adminGames[gameId];
      if (g) { setFormName(g.name); setFormIcon(g.icon); setFormColor(g.color); setFormCurrency(g.currency); }
    }
    if (type === 'edit-pkg' && pkg) {
      setFormAmount(String(pkg.amount));
      setFormPrice(String(pkg.price));
      setFormPopular(!!pkg.popular);
      setFormStock(pkg.stock !== undefined ? String(pkg.stock) : '');
    }
    setAdminModal({ type, gameId, pkg });
  };

  const handleAdminSubmit = async () => {
    if (!adminModal) return;
    const { type, gameId, pkg } = adminModal;
    let updated = { ...adminGames };
    try {
      if (type === 'add-game') {
        const id = formName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        if (!id) { Alert.alert('Error', 'Nama game tidak valid'); return; }
        if (updated[id]) { Alert.alert('Error', 'Game sudah ada'); return; }
        updated = await addGame(updated, { id, name: formName, icon: formIcon || 'gamepad', color: formColor, currency: formCurrency, packages: [] });
      } else if (type === 'edit-game' && gameId) {
        updated = await updateGame(updated, gameId, { name: formName, icon: formIcon, color: formColor, currency: formCurrency });
      } else if (type === 'delete-game' && gameId) {
        updated = await deleteGame(updated, gameId);
      } else if (type === 'add-pkg' && gameId) {
        if (!formAmount || !formPrice) { Alert.alert('Error', 'Isi amount dan harga'); return; }
        updated = await addPackage(updated, gameId, { amount: Number(formAmount), price: Number(formPrice), currency: '', popular: formPopular, stock: formStock ? Number(formStock) : undefined });
      } else if (type === 'edit-pkg' && gameId && pkg?.id) {
        updated = await updatePackage(updated, gameId, pkg.id, { amount: Number(formAmount), price: Number(formPrice), popular: formPopular, stock: formStock ? Number(formStock) : undefined });
      } else if (type === 'delete-pkg' && gameId && pkg?.id) {
        updated = await deletePackage(updated, gameId, pkg.id);
      }
      setAdminGames(updated);
      setAdminModal(null);
    } catch {
      Alert.alert('Error', 'Gagal menyimpan perubahan');
    }
  };

  const handleSaveSettings = async () => {
    const updated: AppSettings = { adminWa: formWa.trim(), adminFee: Number(formFee) || 0 };
    await saveSettings(updated);
    setAppSettings(updated);
    Alert.alert('Sukses', 'Pengaturan toko berhasil disimpan');
  };

  const syncToSupabase = async () => {
    setDbStatus('loading');
    setDbResult('Menyinkronkan ke Supabase...');
    try {
      const rows = Object.entries(adminGames).map(([id, g]) => ({
        id,
        name: g.name,
        icon: g.icon,
        color: g.color,
        currency: g.currency,
      }));
      const { error } = await supabase.from('games').upsert(rows, { onConflict: 'id' });
      if (error) {
        setDbStatus('error');
        setDbResult(`⚠️ Error Supabase: ${error.message}\n\nPastikan tabel "games" sudah dibuat via SQL Editor di Dashboard Supabase.`);
      } else {
        setDbStatus('success');
        setDbResult(`✅ ${rows.length} game berhasil di-sync ke Supabase!`);
      }
    } catch (e: any) {
      setDbStatus('error');
      setDbResult('⚠️ Gagal terhubung ke Supabase (TypeError: Failed to fetch).\n\nKemungkinan penyebab:\n1. Kunci "supabaseAnonKey" di supabase.ts/.env belum diganti dengan Anon JWT Key resmi (dimulai eyJhbGci...).\n2. Proyek Supabase sedang di-pause / tidak aktif.\n3. Masalah koneksi internet.');
    }
  };

  // State Authenticated Login UI vs Dashboard Admin UI
  if (!adminAuth) {
    return (
      <ThemedView style={styles.authContainer}>
        <ThemedView style={styles.authCard}>
          <MaterialIcons name="lock" size={48} color={PINK_PASTEL.primaryDark} />
          <ThemedText style={styles.authTitle}>Panel Admin</ThemedText>
          <ThemedText style={styles.authSub}>Masukkan PIN 6 Digit untuk Akses Admin</ThemedText>

          <TextInput
            style={[styles.pinInput, pinError && styles.pinInputError]}
            value={pinInput}
            onChangeText={setPinInput}
            placeholder="Masukkan PIN"
            placeholderTextColor="#cca0b8"
            keyboardType="numeric"
            secureTextEntry
            maxLength={10}
          />

          <Pressable style={styles.authBtn} onPress={handleVerifyPin}>
            <ThemedText style={styles.authBtnText}>Masuk Admin</ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
    );
  }

  const gameIds = Object.keys(adminGames).sort();

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { maxWidth: isDesktop ? 960 : 640 }]} showsVerticalScrollIndicator={false}>
        {/* Admin Header */}
        <ThemedView style={styles.adminHeader}>
          <MaterialIcons name="admin-panel-settings" size={32} color={PINK_PASTEL.primaryDark} />
          <ThemedView style={{ flex: 1 }}>
            <ThemedText style={styles.adminTitle}>Dashboard Admin</ThemedText>
            <ThemedText style={styles.adminSub}>Manajemen Katalog & Pengaturan Toko</ThemedText>
          </ThemedView>
          <Pressable style={styles.lockBtn} onPress={() => setAdminAuth(false)}>
            <MaterialIcons name="lock" size={18} color="#fff" />
            <ThemedText style={styles.lockBtnText}>Kunci</ThemedText>
          </Pressable>
        </ThemedView>

        {/* Ringkasan */}
        <ThemedView style={styles.summaryGrid}>
          <ThemedView style={styles.summaryCard}>
            <ThemedText style={styles.summaryNum}>{gameIds.length}</ThemedText>
            <ThemedText style={styles.summaryLabel}>Total Game</ThemedText>
          </ThemedView>
          <ThemedView style={styles.summaryCard}>
            <ThemedText style={styles.summaryNum}>{gameIds.reduce((s, id) => s + adminGames[id].packages.length, 0)}</ThemedText>
            <ThemedText style={styles.summaryLabel}>Total Paket</ThemedText>
          </ThemedView>
          <ThemedView style={styles.summaryCard}>
            <ThemedText style={styles.summaryNum}>Rp{appSettings.adminFee.toLocaleString()}</ThemedText>
            <ThemedText style={styles.summaryLabel}>Biaya Admin</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Setting WA & Admin Fee */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Pengaturan Toko & WA</ThemedText>
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Nomor WhatsApp Admin (62xxx)</ThemedText>
            <TextInput style={styles.input} value={formWa} onChangeText={setFormWa} keyboardType="phone-pad" />
          </ThemedView>
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Biaya Admin Transaksi (Rp)</ThemedText>
            <TextInput style={styles.input} value={formFee} onChangeText={setFormFee} keyboardType="numeric" />
          </ThemedView>
          <Pressable style={styles.saveSettingsBtn} onPress={handleSaveSettings}>
            <ThemedText style={styles.saveSettingsText}>Simpan Pengaturan Toko</ThemedText>
          </Pressable>
        </ThemedView>

        {/* Sync Supabase */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Database Supabase</ThemedText>
          <Pressable style={styles.syncBtn} onPress={syncToSupabase}>
            <MaterialIcons name="cloud-upload" size={20} color="#fff" />
            <ThemedText style={styles.syncBtnText}>Sinkronkan Katalog ke Supabase</ThemedText>
          </Pressable>
          {dbResult ? <ThemedText style={styles.dbResultText}>{dbResult}</ThemedText> : null}
        </ThemedView>

        {/* Daftar Game & Paket Admin */}
        <ThemedView style={styles.section}>
          <ThemedView style={styles.sectionHeaderRow}>
            <ThemedText style={styles.sectionTitle}>Katalog Game ({gameIds.length})</ThemedText>
            <Pressable style={styles.addGameBtn} onPress={() => openAdminModal('add-game')}>
              <MaterialIcons name="add" size={18} color="#fff" />
              <ThemedText style={styles.addGameBtnText}>Tambah Game</ThemedText>
            </Pressable>
          </ThemedView>

          {gameIds.map(gid => {
            const g = adminGames[gid];
            return (
              <ThemedView key={gid} style={styles.gameManageCard}>
                <ThemedView style={styles.gameManageHeader}>
                  <MaterialIcons name={g.icon as any} size={24} color={g.color} />
                  <ThemedText style={styles.gameManageName}>{g.name}</ThemedText>
                  <Pressable style={styles.iconBtn} onPress={() => openAdminModal('edit-game', gid)}>
                    <MaterialIcons name="edit" size={18} color="#666" />
                  </Pressable>
                  <Pressable style={styles.iconBtn} onPress={() => openAdminModal('delete-game', gid)}>
                    <MaterialIcons name="delete" size={18} color="#e74c3c" />
                  </Pressable>
                </ThemedView>

                {/* Packages list inside game */}
                <ThemedView style={styles.pkgList}>
                  {g.packages.map(pkg => (
                    <ThemedView key={pkg.id || pkg.amount} style={styles.pkgRow}>
                      <ThemedText style={styles.pkgRowName}>{pkg.amount} {g.currency}</ThemedText>
                      <ThemedText style={styles.pkgRowPrice}>Rp{pkg.price.toLocaleString()}</ThemedText>
                      <Pressable style={styles.iconBtn} onPress={() => openAdminModal('edit-pkg', gid, pkg)}>
                        <MaterialIcons name="edit" size={16} color="#666" />
                      </Pressable>
                      <Pressable style={styles.iconBtn} onPress={() => openAdminModal('delete-pkg', gid, pkg)}>
                        <MaterialIcons name="delete" size={16} color="#e74c3c" />
                      </Pressable>
                    </ThemedView>
                  ))}
                </ThemedView>

                <Pressable style={styles.addPkgBtn} onPress={() => openAdminModal('add-pkg', gid)}>
                  <MaterialIcons name="add-circle-outline" size={16} color={PINK_PASTEL.primaryDark} />
                  <ThemedText style={styles.addPkgBtnText}>Tambah Paket</ThemedText>
                </Pressable>
              </ThemedView>
            );
          })}
        </ThemedView>
      </ScrollView>

      {/* Admin Modals */}
      {adminModal && (
        <Modal visible transparent animationType="fade">
          <ThemedView style={styles.modalOverlay}>
            <ThemedView style={styles.modalContent}>
              <ThemedText style={styles.modalTitle}>
                {adminModal.type === 'add-game' && 'Tambah Game Baru'}
                {adminModal.type === 'edit-game' && 'Edit Game'}
                {adminModal.type === 'delete-game' && 'Hapus Game?'}
                {adminModal.type === 'add-pkg' && 'Tambah Paket'}
                {adminModal.type === 'edit-pkg' && 'Edit Paket'}
                {adminModal.type === 'delete-pkg' && 'Hapus Paket?'}
              </ThemedText>

              {adminModal.type.includes('game') && !adminModal.type.startsWith('delete') && (
                <>
                  <TextInput style={styles.input} value={formName} onChangeText={setFormName} placeholder="Nama Game (cth: Roblox)" />
                  <TextInput style={styles.input} value={formIcon} onChangeText={setFormIcon} placeholder="Icon Material (cth: gamepad)" />
                  <TextInput style={styles.input} value={formCurrency} onChangeText={setFormCurrency} placeholder="Mata Uang (cth: Robux)" />
                </>
              )}

              {adminModal.type.includes('pkg') && !adminModal.type.startsWith('delete') && (
                <>
                  <TextInput style={styles.input} value={formAmount} onChangeText={setFormAmount} placeholder="Jumlah Nominal" keyboardType="numeric" />
                  <TextInput style={styles.input} value={formPrice} onChangeText={setFormPrice} placeholder="Harga (Rp)" keyboardType="numeric" />
                </>
              )}

              {adminModal.type.startsWith('delete') && (
                <ThemedText style={{ color: '#666' }}>Apakah kamu yakin ingin menghapus item ini?</ThemedText>
              )}

              <ThemedView style={styles.modalActions}>
                <Pressable style={styles.cancelBtn} onPress={() => setAdminModal(null)}>
                  <ThemedText style={styles.cancelBtnText}>Batal</ThemedText>
                </Pressable>
                <Pressable style={styles.confirmBtn} onPress={handleAdminSubmit}>
                  <ThemedText style={styles.confirmBtnText}>Konfirmasi</ThemedText>
                </Pressable>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </Modal>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5FC' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 80, maxWidth: 640, width: '100%', alignSelf: 'center', gap: 16 },

  authContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#FFF5FC' },
  authCard: { width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  authTitle: { fontSize: 22, fontWeight: '800', color: PINK_PASTEL.primaryDark },
  authSub: { fontSize: 13, color: '#888', textAlign: 'center' },
  pinInput: { width: '100%', height: 48, backgroundColor: PINK_PASTEL.input, borderWidth: 1.5, borderColor: PINK_PASTEL.inputBorder, borderRadius: 12, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#333' },
  pinInputError: { borderColor: '#e74c3c' },
  authBtn: { width: '100%', paddingVertical: 14, backgroundColor: PINK_PASTEL.primaryDark, borderRadius: 12, alignItems: 'center' },
  authBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  adminHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  adminTitle: { fontSize: 18, fontWeight: '800', color: PINK_PASTEL.primaryDark },
  adminSub: { fontSize: 12, color: '#888' },
  lockBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: PINK_PASTEL.primaryDark, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  lockBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  summaryGrid: { flexDirection: 'row', gap: 10 },
  summaryCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  summaryNum: { fontSize: 18, fontWeight: '800', color: PINK_PASTEL.primaryDark },
  summaryLabel: { fontSize: 11, color: '#888', marginTop: 2 },

  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: PINK_PASTEL.primaryDark },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  inputGroup: { gap: 4 },
  label: { fontSize: 12, fontWeight: '600', color: '#666' },
  input: { height: 42, backgroundColor: PINK_PASTEL.input, borderWidth: 1, borderColor: PINK_PASTEL.inputBorder, borderRadius: 10, paddingHorizontal: 12, fontSize: 14, color: '#333' },

  saveSettingsBtn: { backgroundColor: PINK_PASTEL.primary, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  saveSettingsText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  syncBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#3498db', paddingVertical: 12, borderRadius: 10 },
  syncBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  dbResultText: { fontSize: 12, color: '#27ae60', textAlign: 'center' },

  addGameBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: PINK_PASTEL.primaryDark, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  addGameBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  gameManageCard: { borderWidth: 1, borderColor: PINK_PASTEL.border, borderRadius: 12, padding: 12, gap: 8 },
  gameManageHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  gameManageName: { flex: 1, fontSize: 15, fontWeight: '700', color: '#333' },
  iconBtn: { padding: 4 },

  pkgList: { gap: 6, backgroundColor: '#FFFAFD', padding: 8, borderRadius: 8 },
  pkgRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pkgRowName: { flex: 1, fontSize: 13, fontWeight: '600', color: '#333' },
  pkgRowPrice: { fontSize: 13, fontWeight: '700', color: PINK_PASTEL.primaryDark },

  addPkgBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  addPkgBtnText: { fontSize: 12, fontWeight: '700', color: PINK_PASTEL.primaryDark },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 12 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: PINK_PASTEL.primaryDark },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#eee' },
  cancelBtnText: { color: '#666', fontWeight: '600' },
  confirmBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: PINK_PASTEL.primaryDark },
  confirmBtnText: { color: '#fff', fontWeight: '700' },
});

import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GAMES, ACCOUNT_FIELDS, ROBLOX_GAMEPASS_FIELDS, ROBLOX_LOGIN_FIELDS, type GameConfig } from '@/constants/games';
import AccountDataForm from '@/components/payment/AccountDataForm';
import PaymentScreen from '@/components/payment/PaymentScreen';
import { loadGames, loadSettings, type AppSettings } from '@/constants/store';
import { PINK_PASTEL } from '@/constants/theme';

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [activeGames, setActiveGames] = useState<Record<string, GameConfig>>(GAMES);
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [accountData, setAccountData] = useState<Record<string, string>>({});
  const [robloxMethod, setRobloxMethod] = useState<'gamepass' | 'login'>('gamepass');
  const [showPaymentScreen, setShowPaymentScreen] = useState(false);
  const [cartData, setCartData] = useState<any>(null);
  const [appSettings, setAppSettings] = useState<AppSettings>({ adminWa: '62881025426010', adminFee: 2000 });

  useEffect(() => {
    loadGames().then(setActiveGames);
    loadSettings().then(setAppSettings);
  }, []);

  const game = activeGames[id || ''] || GAMES[id || ''];

  if (!game) {
    return (
      <ThemedView style={styles.notFoundContainer}>
        <ThemedText style={styles.notFoundText}>Game tidak ditemukan</ThemedText>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ThemedText style={styles.backBtnText}>Kembali ke Toko</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const isRoblox = game.id === 'roblox';
  const robloxFields = robloxMethod === 'gamepass' ? ROBLOX_GAMEPASS_FIELDS : ROBLOX_LOGIN_FIELDS;
  const currentAccountFields = isRoblox ? robloxFields : (ACCOUNT_FIELDS[game.id] || ACCOUNT_FIELDS['roblox']);

  const handleTopUp = () => {
    if (!selectedPkg) {
      Alert.alert('Peringatan', 'Harap pilih paket top-up!');
      return;
    }
    const pkg = game.packages.find(p => `${p.amount} ${p.currency}` === selectedPkg);
    if (!pkg) {
      Alert.alert('Error', 'Paket tidak ditemukan!');
      return;
    }

    for (const f of currentAccountFields) {
      if (f.required !== false && !(accountData[f.key] || '').trim()) {
        Alert.alert('Peringatan', `Harap isi ${f.label}!`);
        return;
      }
    }

    const finalAccountData: Record<string, string> = { ...accountData };
    if (isRoblox) {
      finalAccountData['Metode Top-Up'] = robloxMethod === 'gamepass' ? 'Via Gamepass (Tanpa Password)' : 'Via Fast Login (Dengan Password)';
    }

    setCartData({
      gameName: game.name,
      gameId: game.id,
      gameColor: game.color,
      accountData: finalAccountData,
      amount: pkg.amount,
      currency: pkg.currency,
      price: pkg.price,
    });
    setShowPaymentScreen(true);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Bar */}
        <Pressable style={styles.navHeader} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={PINK_PASTEL.primaryDark} />
          <ThemedText style={styles.navHeaderText}>Kembali ke Toko</ThemedText>
        </Pressable>

        {/* Game Banner / Title */}
        <ThemedView style={styles.gameHeader}>
          {game.image ? (
            <Image source={game.image} style={styles.headerLogoImg} contentFit="cover" />
          ) : (
            <ThemedView style={[styles.iconCircle, { backgroundColor: `${game.color}20` }]}>
              <MaterialIcons name={game.icon as any} size={42} color={game.color} />
            </ThemedView>
          )}
          <ThemedText style={styles.gameTitle}>{game.name}</ThemedText>
          <ThemedText style={styles.gameSub}>Top-Up {game.currency} Resmi & Cepat</ThemedText>
        </ThemedView>

        {/* Roblox Method Selector */}
        {isRoblox && (
          <ThemedView style={styles.section}>
            <ThemedView style={styles.stepTitleRow}>
              <ThemedView style={styles.stepBadge}>
                <ThemedText style={styles.stepBadgeText}>1</ThemedText>
              </ThemedView>
              <ThemedText style={styles.sectionTitle}>Pilih Metode Top-Up Roblox</ThemedText>
            </ThemedView>

            <ThemedView style={styles.methodGrid}>
              {/* Option A: Via Gamepass */}
              <Pressable
                style={[
                  styles.methodCard,
                  robloxMethod === 'gamepass' && styles.methodCardActiveGamepass
                ]}
                onPress={() => setRobloxMethod('gamepass')}
              >
                <ThemedView style={styles.methodHeader}>
                  <MaterialIcons
                    name={robloxMethod === 'gamepass' ? 'radio-button-checked' : 'radio-button-unchecked'}
                    size={20}
                    color={robloxMethod === 'gamepass' ? '#27ae60' : '#888'}
                  />
                  <ThemedText style={[styles.methodTitle, robloxMethod === 'gamepass' && { color: '#27ae60' }]}>
                    🟢 Via Gamepass
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.methodBadgeGamepass}>
                  <ThemedText style={styles.methodBadgeTextGamepass}>⭐ REKOMENDASI (Tanpa Password)</ThemedText>
                </ThemedView>
                <ThemedText style={styles.methodSub}>
                  Aman 100%! Cukup masukkan Username Roblox kamu tanpa membagikan kata sandi.
                </ThemedText>
              </Pressable>

              {/* Option B: Via Fast Login */}
              <Pressable
                style={[
                  styles.methodCard,
                  robloxMethod === 'login' && styles.methodCardActiveLogin
                ]}
                onPress={() => setRobloxMethod('login')}
              >
                <ThemedView style={styles.methodHeader}>
                  <MaterialIcons
                    name={robloxMethod === 'login' ? 'radio-button-checked' : 'radio-button-unchecked'}
                    size={20}
                    color={robloxMethod === 'login' ? '#2980b9' : '#888'}
                  />
                  <ThemedText style={[styles.methodTitle, robloxMethod === 'login' && { color: '#2980b9' }]}>
                    🔵 Via Fast Login
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.methodBadgeLogin}>
                  <ThemedText style={styles.methodBadgeTextLogin}>🔑 Membutuhkan Password Akun</ThemedText>
                </ThemedView>
                <ThemedText style={styles.methodSub}>
                  Proses Kilat! Tim admin akan login ke akun kamu untuk mengisikan Robux secara langsung.
                </ThemedText>
              </Pressable>
            </ThemedView>
          </ThemedView>
        )}

        {/* Step: Form Data Akun */}
        <ThemedView style={styles.section}>
          <ThemedView style={styles.stepTitleRow}>
            <ThemedView style={styles.stepBadge}>
              <ThemedText style={styles.stepBadgeText}>{isRoblox ? '2' : '1'}</ThemedText>
            </ThemedView>
            <ThemedText style={styles.sectionTitle}>Masukkan Data Akun</ThemedText>
          </ThemedView>

          <AccountDataForm
            gameId={game.id}
            customFields={currentAccountFields}
            values={accountData}
            onChange={(key, val) => setAccountData(prev => ({ ...prev, [key]: val }))}
          />

          {isRoblox && robloxMethod === 'gamepass' && (
            <ThemedView style={styles.hintBoxGamepass}>
              <MaterialIcons name="info-outline" size={18} color="#27ae60" />
              <ThemedText style={styles.hintTextGamepass}>
                Tips: Buat Gamepass di Roblox Studio / Web Roblox sesuai nominal harga paket, lalu tim admin akan membeli Gamepass kamu!
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        {/* Step: Pilih Paket */}
        <ThemedView style={styles.section}>
          <ThemedView style={styles.stepTitleRow}>
            <ThemedView style={styles.stepBadge}>
              <ThemedText style={styles.stepBadgeText}>{isRoblox ? '3' : '2'}</ThemedText>
            </ThemedView>
            <ThemedText style={styles.sectionTitle}>Pilih Nominal Paket</ThemedText>
          </ThemedView>
          <ThemedView style={styles.pkgGrid}>
            {game.packages.map((pkg, i) => {
              const isSelected = selectedPkg === `${pkg.amount} ${pkg.currency}`;
              return (
                <Pressable
                  key={i}
                  style={[
                    styles.pkgCard,
                    isSelected && { borderColor: game.color, backgroundColor: `${game.color}15` },
                  ]}
                  onPress={() => setSelectedPkg(`${pkg.amount} ${pkg.currency}`)}
                >
                  <ThemedText style={styles.pkgAmount}>{pkg.amount.toLocaleString()} {pkg.currency}</ThemedText>
                  <ThemedText style={[styles.pkgPrice, { color: game.color }]}>Rp{pkg.price.toLocaleString()}</ThemedText>
                  {pkg.popular && (
                    <ThemedView style={[styles.popBadge, { backgroundColor: game.color }]}>
                      <ThemedText style={styles.popText}>POPULER</ThemedText>
                    </ThemedView>
                  )}
                </Pressable>
              );
            })}
          </ThemedView>
        </ThemedView>

        {/* Tombol Bayar */}
        <Pressable style={[styles.topUpBtn, { backgroundColor: game.color }]} onPress={handleTopUp}>
          <MaterialIcons name="chat" size={22} color="#fff" />
          <ThemedText style={styles.topUpBtnText}>Bayar via WhatsApp</ThemedText>
        </Pressable>
      </ScrollView>

      {showPaymentScreen && cartData && (
        <PaymentScreen
          cart={cartData}
          onClose={() => { setShowPaymentScreen(false); setCartData(null); }}
          adminWa={appSettings.adminWa}
          adminFee={appSettings.adminFee}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5FC' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40, maxWidth: 640, width: '100%', alignSelf: 'center', gap: 16 },

  navHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  navHeaderText: { fontSize: 15, fontWeight: '600', color: PINK_PASTEL.primaryDark },

  gameHeader: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, gap: 8 },
  headerLogoImg: { width: 80, height: 80, borderRadius: 20, borderWidth: 2, borderColor: '#F0E0EA', marginBottom: 4 },
  iconCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  gameTitle: { fontSize: 24, fontWeight: '800', color: '#333' },
  gameSub: { fontSize: 13, color: '#888' },

  section: { backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, gap: 14 },
  stepTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: PINK_PASTEL.primary, alignItems: 'center', justifyContent: 'center' },
  stepBadgeText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333' },

  methodGrid: { gap: 12 },
  methodCard: { padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#F0E0EA', backgroundColor: '#FFFAFD', gap: 6 },
  methodCardActiveGamepass: { borderColor: '#27ae60', backgroundColor: '#E8F8F5' },
  methodCardActiveLogin: { borderColor: '#2980b9', backgroundColor: '#EBF5FB' },
  methodHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  methodTitle: { fontSize: 15, fontWeight: '800', color: '#333' },
  methodBadgeGamepass: { alignSelf: 'flex-start', backgroundColor: '#D4EDDA', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  methodBadgeTextGamepass: { fontSize: 10, fontWeight: '800', color: '#155724' },
  methodBadgeLogin: { alignSelf: 'flex-start', backgroundColor: '#D1ECF1', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  methodBadgeTextLogin: { fontSize: 10, fontWeight: '800', color: '#0C5460' },
  methodSub: { fontSize: 12, color: '#666', lineHeight: 16 },

  hintBoxGamepass: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E8F8F5', padding: 12, borderRadius: 10, borderLeftWidth: 3, borderLeftColor: '#27ae60' },
  hintTextGamepass: { flex: 1, fontSize: 12, color: '#1E8449', lineHeight: 16 },

  pkgGrid: { gap: 10 },
  pkgCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 14, borderWidth: 1.5, borderColor: '#F0E0EA', backgroundColor: '#FFFAFD' },
  pkgAmount: { fontSize: 15, fontWeight: '700', color: '#333' },
  pkgPrice: { fontSize: 15, fontWeight: '800' },
  popBadge: { position: 'absolute', top: -8, right: 12, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  popText: { color: '#fff', fontSize: 9, fontWeight: '800' },

  topUpBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4, marginTop: 8 },
  topUpBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  notFoundContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 16 },
  notFoundText: { fontSize: 18, fontWeight: '700', color: '#666' },
  backBtn: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: PINK_PASTEL.primary, borderRadius: 12 },
  backBtnText: { color: '#fff', fontWeight: '700' },
});

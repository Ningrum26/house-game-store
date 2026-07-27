import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GAMES, ACCOUNT_FIELDS, type GameConfig, type TopUpPackage } from '@/constants/games';
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
    const fields = ACCOUNT_FIELDS[game.id] || ACCOUNT_FIELDS['roblox'];
    for (const f of fields) {
      if (f.required !== false && !(accountData[f.key] || '').trim()) {
        Alert.alert('Peringatan', `Harap isi ${f.label}!`);
        return;
      }
    }
    setCartData({
      gameName: game.name,
      gameId: game.id,
      gameColor: game.color,
      accountData: { ...accountData },
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

        {/* Step 1: Form Data Akun */}
        <ThemedView style={styles.section}>
          <ThemedView style={styles.stepTitleRow}>
            <ThemedView style={styles.stepBadge}>
              <ThemedText style={styles.stepBadgeText}>1</ThemedText>
            </ThemedView>
            <ThemedText style={styles.sectionTitle}>Masukkan Data Akun</ThemedText>
          </ThemedView>
          <AccountDataForm
            gameId={game.id}
            values={accountData}
            onChange={(key, val) => setAccountData(prev => ({ ...prev, [key]: val }))}
          />
        </ThemedView>

        {/* Step 2: Pilih Paket */}
        <ThemedView style={styles.section}>
          <ThemedView style={styles.stepTitleRow}>
            <ThemedView style={styles.stepBadge}>
              <ThemedText style={styles.stepBadgeText}>2</ThemedText>
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

        {/* Step 3: Tombol Bayar */}
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

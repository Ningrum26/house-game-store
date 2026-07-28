import { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, Pressable, View, Linking, Alert, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getOrders, clearOrders, deleteOrder, updateOrderStatus, type OrderItem } from '@/constants/orders';
import { GAMES, ACCOUNT_FIELDS } from '@/constants/games';
import { PINK_PASTEL } from '@/constants/theme';
import { loadSettings } from '@/constants/store';

export default function HistoryScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [adminWa, setAdminWa] = useState('62881025426010');

  const fetchOrders = useCallback(async () => {
    const list = await getOrders();
    setOrders(list);
    const settings = await loadSettings();
    setAdminWa(settings.adminWa);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const handleClearHistory = async () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Hapus semua riwayat pesanan?')) {
        await clearOrders();
        setOrders([]);
      }
    } else {
      Alert.alert('Hapus Riwayat?', 'Semua catatan riwayat pesanan lokal akan dihapus.', [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            await clearOrders();
            setOrders([]);
          },
        },
      ]);
    }
  };

  const handleDeleteSingleOrder = async (id: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Hapus pesanan ini dari riwayat?')) {
        const updated = await deleteOrder(id);
        setOrders(updated);
      }
    } else {
      Alert.alert('Hapus Pesanan?', 'Pesanan ini akan dihapus dari riwayat.', [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            const updated = await deleteOrder(id);
            setOrders(updated);
          },
        },
      ]);
    }
  };

  const handleTogglePaidStatus = async (order: OrderItem) => {
    const nextStatus = order.status === 'Selesai' ? 'Menunggu Pembayaran' : 'Selesai';
    const updated = await updateOrderStatus(order.id, nextStatus);
    setOrders(updated);
  };

  const reOpenWhatsApp = (order: OrderItem) => {
    const lines: string[] = [];
    lines.push('*PESANAN AII TOP-UP*');
    lines.push(`Kode Order: *${order.id}*`);
    lines.push('');
    lines.push(`Game: *${order.gameName}*`);
    lines.push(`Paket: *${order.amount.toLocaleString()} ${order.currency}*`);
    lines.push('');
    const keyToLabel: Record<string, string> = {
      'user_id': order.gameId === 'roblox' ? 'Username Roblox' : 'ID Pemain',
      'password': 'Kata Sandi',
      'server_id': 'Server / Zona',
      'nickname': 'Nickname',
    };
    if (order.accountData) {
      for (const [k, v] of Object.entries(order.accountData)) {
        if (!v) continue;
        const label = keyToLabel[k] || k;
        lines.push(`${label}: ${v}`);
      }
    }
    lines.push('');
    lines.push(`Harga: Rp${order.price.toLocaleString()}`);
    lines.push(`Admin: Rp${order.fee.toLocaleString()}`);
    lines.push(`*Total: Rp${order.total.toLocaleString()}*`);

    const msg = lines.join('\n');
    const url = `https://wa.me/${adminWa}?text=${encodeURIComponent(msg)}`;
    Linking.openURL(url).catch(() => {});
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header Bar */}
      <ThemedView style={styles.header}>
        <MaterialIcons name="receipt-long" size={28} color={PINK_PASTEL.primaryDark} />
        <ThemedView style={{ flex: 1 }}>
          <ThemedText style={styles.headerTitle}>Riwayat Pembelian</ThemedText>
          <ThemedText style={styles.headerSub}>Catatan pesanan top-up kamu (Tersimpan Lokal)</ThemedText>
        </ThemedView>

        {orders.length > 0 && (
          <Pressable style={styles.clearBtn} onPress={handleClearHistory}>
            <MaterialIcons name="delete-sweep" size={24} color="#e74c3c" />
          </Pressable>
        )}
      </ThemedView>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {orders.length === 0 ? (
          <ThemedView style={styles.emptyCard}>
            <MaterialIcons name="shopping-bag" size={56} color="#dba1c4" />
            <ThemedText style={styles.emptyTitle}>Belum Ada Riwayat Pesanan</ThemedText>
            <ThemedText style={styles.emptySub}>
              Pesanan top-up yang kamu buat di web ini akan tersimpan otomatis di sini.
            </ThemedText>
            <Pressable style={styles.shopBtn} onPress={() => router.push('/(tabs)')}>
              <MaterialIcons name="storefront" size={20} color="#fff" />
              <ThemedText style={styles.shopBtnText}>Beli Top-Up Sekarang</ThemedText>
            </Pressable>
          </ThemedView>
        ) : (
          orders.map(order => {
            const gameConfig = GAMES[order.gameId];
            const gameImg = gameConfig?.image;
            const fields = ACCOUNT_FIELDS[order.gameId] || [];
            const isPaid = order.status === 'Selesai';

            return (
              <ThemedView key={order.id} style={styles.orderCard}>
                {/* Order Top Row */}
                <View style={styles.cardHeader}>
                  {gameImg ? (
                    <Image source={gameImg} style={styles.cardLogoImg} contentFit="cover" />
                  ) : (
                    <View style={[styles.cardLogoCircle, { backgroundColor: `${order.gameColor}20` }]}>
                      <MaterialIcons name="sports-esports" size={22} color={order.gameColor} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.cardGameName}>{order.gameName}</ThemedText>
                    <ThemedText style={styles.cardOrderCode}>{order.id} • {formatDate(order.createdAt)}</ThemedText>
                  </View>

                  <View style={[styles.statusBadge, isPaid ? styles.statusBadgePaid : styles.statusBadgePending]}>
                    <ThemedText style={[styles.statusBadgeText, isPaid ? styles.statusTextPaid : styles.statusTextPending]}>
                      {isPaid ? '✅ Sudah Dibayar' : 'Menunggu Pembayaran'}
                    </ThemedText>
                  </View>

                  <Pressable style={styles.deleteSingleBtn} onPress={() => handleDeleteSingleOrder(order.id)}>
                    <MaterialIcons name="close" size={18} color="#999" />
                  </Pressable>
                </View>

                <View style={styles.line} />

                {/* Package & Account Info */}
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Paket Nominal</ThemedText>
                  <ThemedText style={styles.detailValueBold}>{order.amount.toLocaleString()} {order.currency}</ThemedText>
                </View>

                {order.accountData && Object.entries(order.accountData).map(([k, v]) => {
                  if (!v) return null;
                  const keyToLabel: Record<string, string> = {
                    'user_id': order.gameId === 'roblox' ? 'Username Roblox' : 'ID Pemain',
                    'password': 'Kata Sandi',
                    'server_id': 'Server / Zona',
                    'nickname': 'Nickname',
                  };
                  const label = keyToLabel[k] || k;
                  return (
                    <View key={k} style={styles.detailRow}>
                      <ThemedText style={styles.detailLabel}>{label}</ThemedText>
                      <ThemedText style={styles.detailValue}>{v}</ThemedText>
                    </View>
                  );
                })}

                <View style={styles.line} />

                {/* Total & Actions */}
                <View style={styles.cardFooter}>
                  <View>
                    <ThemedText style={styles.totalLabel}>Total Pembayaran</ThemedText>
                    <ThemedText style={styles.totalVal}>Rp{order.total.toLocaleString()}</ThemedText>
                  </View>

                  <View style={styles.actionRow}>
                    <Pressable
                      style={[styles.statusToggleBtn, isPaid ? styles.statusTogglePaid : styles.statusTogglePending]}
                      onPress={() => handleTogglePaidStatus(order)}
                    >
                      <MaterialIcons name={isPaid ? 'check-circle' : 'change-circle'} size={15} color={isPaid ? '#27ae60' : '#d35400'} />
                      <ThemedText style={[styles.statusToggleText, { color: isPaid ? '#27ae60' : '#d35400' }]}>
                        {isPaid ? 'Sudah Bayar' : 'Tandai Bayar'}
                      </ThemedText>
                    </Pressable>

                    <Pressable style={styles.reWaBtn} onPress={() => reOpenWhatsApp(order)}>
                      <MaterialIcons name="chat" size={15} color="#fff" />
                      <ThemedText style={styles.reWaBtnText}>Kirim Ulang WA</ThemedText>
                    </Pressable>
                  </View>
                </View>
              </ThemedView>
            );
          })
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5FC' },

  header: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: PINK_PASTEL.border },
  headerTitle: { fontSize: 18, fontWeight: '800', color: PINK_PASTEL.primaryDark },
  headerSub: { fontSize: 12, color: '#888' },
  clearBtn: { padding: 6 },

  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40, maxWidth: 640, width: '100%', alignSelf: 'center', gap: 14 },

  emptyCard: { backgroundColor: '#fff', borderRadius: 20, padding: 32, alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: PINK_PASTEL.primaryDark, marginTop: 4 },
  emptySub: { fontSize: 13, color: '#888', textAlign: 'center', maxWidth: 300, lineHeight: 18 },
  shopBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: PINK_PASTEL.primaryDark, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, marginTop: 8 },
  shopBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  orderCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },

  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardLogoImg: { width: 42, height: 42, borderRadius: 10, borderWidth: 1, borderColor: '#F0E0EA' },
  cardLogoCircle: { width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardGameName: { fontSize: 16, fontWeight: '800', color: '#333' },
  cardOrderCode: { fontSize: 11, color: '#888', marginTop: 1 },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusBadgePending: { backgroundColor: '#FFF3CD' },
  statusBadgePaid: { backgroundColor: '#D4EDDA' },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  statusTextPending: { color: '#856404' },
  statusTextPaid: { color: '#155724' },

  deleteSingleBtn: { padding: 4, marginLeft: 2 },

  line: { height: 1, backgroundColor: '#F0E5EC' },

  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 13, color: '#777' },
  detailValue: { fontSize: 13, fontWeight: '600', color: '#333' },
  detailValueBold: { fontSize: 14, fontWeight: '800', color: PINK_PASTEL.primaryDark },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, flexWrap: 'wrap', gap: 10 },
  totalLabel: { fontSize: 11, color: '#888' },
  totalVal: { fontSize: 16, fontWeight: '800', color: '#c4458a' },

  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  statusToggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  statusTogglePending: { borderColor: '#f39c12', backgroundColor: '#FEF5E7' },
  statusTogglePaid: { borderColor: '#27ae60', backgroundColor: '#E8F8F5' },
  statusToggleText: { fontSize: 12, fontWeight: '700' },

  reWaBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#25D366', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  reWaBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});

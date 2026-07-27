import { useRef, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Animated, Linking } from 'react-native';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ACCOUNT_FIELDS, GAMES } from '@/constants/games';
import { saveOrder } from '@/constants/orders';

const ADMIN_WA = '62881025426010';
const ADMIN_FEE = 2000;

interface CartItem {
  gameName: string;
  gameId?: string;
  gameColor: string;
  accountData: Record<string, string>;
  amount: number;
  currency: string;
  price: number;
}

interface Props {
  cart: CartItem;
  onClose: () => void;
  adminWa?: string;
  adminFee?: number;
}

export default function PaymentScreen({ cart, onClose, adminWa, adminFee }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const waNumber = adminWa || ADMIN_WA;
  const fee = adminFee ?? ADMIN_FEE;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const total = cart.price + fee;
  const fields = ACCOUNT_FIELDS[cart.gameId || ''] || [];
  const gameConfig = GAMES[cart.gameId || ''];
  const gameImg = gameConfig?.image;

  const buildMessage = (): string => {
    const lines: string[] = [];
    lines.push('*PESANAN AII TOP-UP*');
    lines.push('');
    lines.push(`Game: *${cart.gameName}*`);
    lines.push(`Paket: *${cart.amount.toLocaleString()} ${cart.currency}*`);
    lines.push('');
    for (const f of fields) {
      const val = cart.accountData?.[f.key];
      if (val) {
        lines.push(`${f.label}: ${f.key.toLowerCase().includes('sandi') || f.key.toLowerCase().includes('password') ? val.split('').map(() => '*').join('') : val}`);
      }
    }
    lines.push('');
    lines.push(`Harga: Rp${cart.price.toLocaleString()}`);
    lines.push(`Admin: Rp${fee.toLocaleString()}`);
    lines.push(`*Total: Rp${total.toLocaleString()}*`);
    return lines.join('\n');
  };

  const openWhatsApp = async () => {
    try {
      await saveOrder({
        gameId: cart.gameId || '',
        gameName: cart.gameName,
        gameColor: cart.gameColor,
        accountData: cart.accountData,
        amount: cart.amount,
        currency: cart.currency,
        price: cart.price,
        fee: fee,
        total: total,
      });
    } catch {}

    const msg = buildMessage();
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://api.whatsapp.com/send?phone=${waNumber}&text=${encodeURIComponent(msg)}`).catch(() => {});
    });
  };

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <View style={styles.centerContainer}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollIn} showsVerticalScrollIndicator={false}>
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Ringkasan Pesanan</Text>
                <Text style={styles.sub}>Periksa rincian lalu bayar via WhatsApp</Text>
              </View>
              <Pressable onPress={onClose} style={styles.xBtn}>
                <MaterialIcons name="close" size={22} color="#666" />
              </Pressable>
            </View>

            {/* Product Summary */}
            <View style={styles.productRow}>
              {gameImg ? (
                <Image source={gameImg} style={styles.gameLogoImg} contentFit="cover" />
              ) : (
                <View style={[styles.iconCircle, { backgroundColor: `${cart.gameColor}20` }]}>
                  <MaterialIcons name="sports-esports" size={26} color={cart.gameColor} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{cart.gameName}</Text>
                <Text style={styles.productPkg}>{cart.amount.toLocaleString()} {cart.currency}</Text>
              </View>
            </View>

            <View style={styles.line} />

            {/* Account Data */}
            {fields.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Data Akun</Text>
                {fields.map(f => {
                  const val = cart.accountData?.[f.key];
                  if (!val) return null;
                  const masked = f.key.toLowerCase().includes('sandi') || f.key.toLowerCase().includes('password');
                  return (
                    <View key={f.key} style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>{f.label}</Text>
                      <Text style={styles.fieldValue}>{masked ? val.replace(/./g, '•') : val}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            <View style={styles.line} />

            {/* Price Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rincian Harga</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Harga Paket</Text>
                <Text style={styles.priceVal}>Rp{cart.price.toLocaleString()}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Biaya Admin</Text>
                <Text style={styles.priceVal}>Rp{fee.toLocaleString()}</Text>
              </View>
              <View style={[styles.priceRow, { marginTop: 4 }]}>
                <Text style={styles.priceLabelBold}>Total Pembayaran</Text>
                <Text style={styles.priceValBold}>Rp{total.toLocaleString()}</Text>
              </View>
            </View>

            {/* WhatsApp Button */}
            <Pressable style={styles.waBtn} onPress={openWhatsApp}>
              <MaterialIcons name="chat" size={22} color="#fff" />
              <Text style={styles.waBtnText}>Bayar via WhatsApp</Text>
            </Pressable>

            <Text style={styles.note}>
              Kamu akan diarahkan ke WhatsApp admin. Sertakan bukti transfer setelah melakukan pembayaran.
            </Text>

            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Kembali / Ubah Pesanan</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    width: '100%',
    maxHeight: '92%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  scroll: {
    width: '100%',
    maxWidth: 480,
  },
  scrollIn: {
    paddingVertical: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333333',
  },
  sub: {
    fontSize: 13,
    color: '#888888',
    marginTop: 2,
  },
  xBtn: {
    padding: 4,
  },

  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFAFD',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0E0EA',
  },
  gameLogoImg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0E0EA',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },
  productPkg: {
    fontSize: 13,
    color: '#888888',
    marginTop: 1,
  },

  line: {
    height: 1,
    backgroundColor: '#F0E5EC',
  },

  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666666',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 13,
    color: '#777777',
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
  },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666666',
  },
  priceVal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  priceLabelBold: {
    fontSize: 15,
    fontWeight: '800',
    color: '#333333',
  },
  priceValBold: {
    fontSize: 17,
    fontWeight: '800',
    color: '#c4458a',
  },

  waBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#25D366',
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 4,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  waBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  note: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 16,
  },

  cancelBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: '#888888',
    fontSize: 13,
    fontWeight: '600',
  },
});

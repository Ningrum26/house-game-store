import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GAMES, type GameConfig } from '@/constants/games';
import { loadGames } from '@/constants/store';
import { PINK_PASTEL } from '@/constants/theme';

export default function StoreCatalogScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [activeGames, setActiveGames] = useState<Record<string, GameConfig>>(GAMES);

  useEffect(() => {
    loadGames().then(setActiveGames);
  }, []);

  const gameIds = Object.keys(activeGames).sort();

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { maxWidth: isDesktop ? 960 : 640 }]} showsVerticalScrollIndicator={false}>
        {/* Banner Image Header */}
        <ThemedView style={[styles.bannerContainer, { height: isDesktop ? 280 : 200 }]}>
          <Image source={require('../../assets/images/Housegame.png')} style={styles.bannerImage} contentFit="cover" />
        </ThemedView>

        {/* Brand Section */}
        <ThemedView style={styles.brandSection}>
          <ThemedText style={styles.brandTitle}>Aii Top-Up</ThemedText>
          <ThemedText style={styles.brandSub}>Top-up Game Termurah & Terpercaya</ThemedText>
        </ThemedView>

        {/* Game List - Responsive Grid */}
        <ThemedText style={styles.sectionLabel}>Daftar Game</ThemedText>
        <ThemedView style={isDesktop ? styles.gameGridDesktop : styles.gameGridMobile}>
          {gameIds.map((gid) => {
            const g = activeGames[gid];
            if (!g) return null;
            return (
              <Pressable
                key={gid}
                style={[styles.gameCard, isDesktop && styles.gameCardDesktop, { borderColor: g.color }]}
                onPress={() => router.push(`/game/${gid}` as any)}
              >
                {g.image ? (
                  <Image source={g.image} style={styles.gameLogoImg} contentFit="cover" />
                ) : (
                  <ThemedView style={[styles.gameIconWrap, { backgroundColor: `${g.color}20` }]}>
                    <MaterialIcons name={g.icon as any} size={32} color={g.color} />
                  </ThemedView>
                )}
                <ThemedView style={styles.gameInfo}>
                  <ThemedText style={[styles.gameName, { color: g.color }]}>{g.name}</ThemedText>
                  <ThemedText style={styles.gameDetail}>{g.currency} • {g.packages.length} paket tersedia</ThemedText>
                </ThemedView>
                <MaterialIcons name="chevron-right" size={26} color={g.color} />
              </Pressable>
            );
          })}
        </ThemedView>

        {/* Bottom Section: AI Banner & Contact Section */}
        <ThemedView style={isDesktop ? styles.bottomRowDesktop : styles.bottomRowMobile}>
          {/* AI Banner Shortcut */}
          <Pressable style={[styles.aiBanner, isDesktop && { flex: 1 }]} onPress={() => router.push('/(tabs)/ai')}>
            <MaterialIcons name="smart-toy" size={28} color="#fff" />
            <ThemedView style={{ flex: 1 }}>
              <ThemedText style={styles.aiBannerTitle}>Butuh Bantuan AI Assistant?</ThemedText>
              <ThemedText style={styles.aiBannerSub}>Tanyakan rekomendasi paket atau cara order 24/7</ThemedText>
            </ThemedView>
          </Pressable>

          {/* Contact Section */}
          <ThemedView style={[styles.contactSection, isDesktop && { flex: 1, marginTop: 0 }]}>
            <ThemedText style={styles.contactTitle}>Hubungi Kami</ThemedText>
            <ThemedView style={styles.contactRow}>
              <MaterialIcons name="phone" size={18} color={PINK_PASTEL.primaryDark} />
              <ThemedText style={styles.contactText}>0881025426010</ThemedText>
            </ThemedView>
            <ThemedView style={styles.contactRow}>
              <MaterialIcons name="camera-alt" size={18} color={PINK_PASTEL.primaryDark} />
              <ThemedText style={styles.contactText}>@Aeezee05</ThemedText>
            </ThemedView>
            <ThemedView style={styles.contactRow}>
              <MaterialIcons name="email" size={18} color={PINK_PASTEL.primaryDark} />
              <ThemedText style={styles.contactText}>aarum1217@gmail.com</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5FC' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 80, width: '100%', alignSelf: 'center', gap: 16 },

  bannerContainer: { width: '100%', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  bannerImage: { width: '100%', height: '100%' },

  brandSection: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  brandTitle: { fontSize: 28, fontWeight: '800', color: PINK_PASTEL.primaryDark, letterSpacing: 0.5 },
  brandSub: { fontSize: 13, color: PINK_PASTEL.textSecondary, marginTop: 2, fontWeight: '600' },

  sectionLabel: { fontSize: 18, fontWeight: '800', color: PINK_PASTEL.primaryDark, marginTop: 4 },

  gameGridMobile: { gap: 14 },
  gameGridDesktop: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  gameCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 18, borderWidth: 1.5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, gap: 14 },
  gameCardDesktop: { width: '48.8%', flexGrow: 1 },
  gameLogoImg: { width: 58, height: 58, borderRadius: 14, borderWidth: 1, borderColor: '#F0E0EA' },
  gameIconWrap: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  gameInfo: { flex: 1 },
  gameName: { fontSize: 18, fontWeight: '700' },
  gameDetail: { fontSize: 13, color: '#888', marginTop: 2 },

  bottomRowMobile: { gap: 14 },
  bottomRowDesktop: { flexDirection: 'row', alignItems: 'stretch', gap: 16, marginTop: 6 },

  aiBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: PINK_PASTEL.primary, borderRadius: 16, padding: 18, gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  aiBannerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  aiBannerSub: { color: '#fff', fontSize: 12, opacity: 0.9, marginTop: 2 },

  contactSection: { backgroundColor: '#fff', borderRadius: 16, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, gap: 10 },
  contactTitle: { fontSize: 15, fontWeight: '700', color: PINK_PASTEL.textPrimary },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  contactText: { fontSize: 13, color: '#666', fontWeight: '600' },
});

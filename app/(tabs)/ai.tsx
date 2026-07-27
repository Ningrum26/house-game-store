import { useState, useRef, useCallback } from 'react';
import { StyleSheet, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GAMES } from '@/constants/games';
import { PINK_PASTEL } from '@/constants/theme';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export default function AIScreen() {
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: 'Halo! Aku AI Assistant Aii Top-Up. Ada yang bisa dibantu untuk top-up Roblox atau Mobile Legends? 😊' },
  ]);
  const chatScrollRef = useRef<ScrollView>(null);

  const getSystemContext = useCallback(() => {
    const gameList = Object.values(GAMES)
      .map(g => `- ${g.name} (${g.currency}): ${g.packages.map(p => `${p.amount} ${p.currency}=Rp${p.price.toLocaleString()}${p.popular ? ' ★POPULER' : ''}`).join(', ')}`)
      .join('\n');

    return `Kamu adalah CS AI Assistant Aii Top-Up, toko top-up game termurah dan terpercaya.

PRODUK TERSEDIA:
${gameList}

PEMBAYARAN:
- Pembayaran dilakukan via WhatsApp Admin
- Pilih paket, isi data akun, lalu klik "Bayar via WhatsApp"
- Admin akan memberikan nomor rekening / QRIS dan memproses pesanan setelah transfer dikonfirmasi
- Biaya admin: Rp2.000

KONTAK:
- WhatsApp: 0881025426010
- Instagram: @Aeezee05

Jawab dengan ramah, bantu pembeli memilih paket sesuai kebutuhan, dan gunakan emotikon yang bersahabat.`;
  }, []);

  const getFallbackReply = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('roblox') || q.includes('robux')) {
      return 'Untuk Roblox, kami menyediakan paket 80 Robux (Rp15.000) hingga 10.000 Robux (Rp1.200.000). Paket paling populer adalah 400 Robux (Rp65.000)! 😊\n\nCara order: Buka tab Toko -> Pilih Roblox -> Masukkan User ID & Pass -> Pilih Paket -> Klik "Bayar via WhatsApp".';
    }
    if (q.includes('ml') || q.includes('mobile legend') || q.includes('diamond')) {
      return 'Untuk Mobile Legends, tersedia paket 86 Diamond (Rp17.000) sampai 2.175 Diamond (Rp375.000). Paket terfavorit adalah 344 Diamond (Rp64.000)! 💎\n\nCara order: Buka tab Toko -> Pilih Mobile Legends -> Masukkan User ID, Zone ID, Server -> Klik "Bayar via WhatsApp".';
    }
    if (q.includes('bayar') || q.includes('pembayaran') || q.includes('wa') || q.includes('whatsapp')) {
      return 'Pembayaran dilakukan langsung melalui WhatsApp Admin (0881025426010). Setelah memilih paket di web, kamu akan otomatis diisi format pesanan dan diarahkan ke WhatsApp Admin untuk transfer via DANA, QRIS, atau Bank! 📱';
    }
    if (q.includes('admin') || q.includes('biaya')) {
      return 'Biaya admin transaksi adalah Rp2.000 per pesanan! 🏷️';
    }
    return 'Halo! Aku AI Assistant Aii Top-Up. Kami menyediakan layanan Top-Up resmi untuk game Roblox & Mobile Legends dengan pembayaran praktis via WhatsApp Admin. Ada yang ingin kamu tanyakan mengenai harga paket atau cara order? 😊';
  };

  const sendChat = useCallback(async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setChatLoading(true);

    try {
      if (GEMINI_API_KEY && GEMINI_API_KEY.startsWith('AIza')) {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: getSystemContext() }] },
            contents: [{ parts: [{ text: msg }] }],
          }),
        });
        const data = await res.json();
        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          const reply = data.candidates[0].content.parts[0].text;
          setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
          setChatLoading(false);
          return;
        }
      }
    } catch {}

    // Fallback CS response if API key is invalid/not configured
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', text: getFallbackReply(msg) }]);
      setChatLoading(false);
    }, 400);
  }, [chatInput, chatLoading, getSystemContext]);

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <MaterialIcons name="smart-toy" size={28} color={PINK_PASTEL.primaryDark} />
        <ThemedView style={{ flex: 1 }}>
          <ThemedText style={styles.headerTitle}>AI Assistant</ThemedText>
          <ThemedText style={styles.headerSub}>Siap membantu 24/7 seputar top-up game</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Chat Messages */}
      <KeyboardAvoidingView style={styles.chatWrapper} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <ScrollView
          ref={chatScrollRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, i) => (
            <ThemedView key={i} style={[styles.chatBubble, msg.role === 'user' ? styles.userChat : styles.aiChat]}>
              <ThemedText style={[styles.chatText, msg.role === 'user' && { color: '#fff' }]}>{msg.text}</ThemedText>
            </ThemedView>
          ))}
          {chatLoading && (
            <ThemedView style={[styles.chatBubble, styles.aiChat]}>
              <ThemedText style={styles.chatText}>Sedang mengetik...</ThemedText>
            </ThemedView>
          )}
        </ScrollView>

        {/* Input Bar */}
        <ThemedView style={styles.chatInputRow}>
          <TextInput
            style={styles.chatField}
            value={chatInput}
            onChangeText={setChatInput}
            placeholder="Tanyakan sesuatu..."
            placeholderTextColor="#dba1c4"
            multiline
          />
          <Pressable
            style={[styles.chatSend, !chatInput.trim() && { opacity: 0.5 }]}
            onPress={sendChat}
            disabled={!chatInput.trim() || chatLoading}
          >
            <MaterialIcons name="send" size={20} color="#fff" />
          </Pressable>
        </ThemedView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5FC' },

  header: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: PINK_PASTEL.border },
  headerTitle: { fontSize: 18, fontWeight: '800', color: PINK_PASTEL.primaryDark },
  headerSub: { fontSize: 12, color: '#888' },

  chatWrapper: { flex: 1 },
  chatArea: { flex: 1 },
  chatContent: { padding: 16, gap: 12 },

  chatBubble: { maxWidth: '82%', padding: 14, borderRadius: 16 },
  userChat: { alignSelf: 'flex-end', backgroundColor: PINK_PASTEL.primaryDark, borderBottomRightRadius: 4 },
  aiChat: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: PINK_PASTEL.border },
  chatText: { fontSize: 14, color: '#333', lineHeight: 20 },

  chatInputRow: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: PINK_PASTEL.border, gap: 10 },
  chatField: { flex: 1, minHeight: 40, maxHeight: 100, backgroundColor: PINK_PASTEL.input, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#333' },
  chatSend: { width: 42, height: 42, borderRadius: 21, backgroundColor: PINK_PASTEL.primaryDark, alignItems: 'center', justifyContent: 'center' },
});

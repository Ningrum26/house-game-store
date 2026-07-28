import { View, Text, TextInput, StyleSheet } from 'react-native';
import { PINK_PASTEL } from '@/constants/theme';
import { ACCOUNT_FIELDS, type AccountField } from '@/constants/games';

interface Props {
  gameId: string;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  customFields?: AccountField[];
}

export default function AccountDataForm({ gameId, values, onChange, customFields }: Props) {
  const fields = customFields || ACCOUNT_FIELDS[gameId] || ACCOUNT_FIELDS['roblox'];

  return (
    <View style={styles.container}>
      {fields.map((f: AccountField) => (
        <View key={f.key} style={styles.fieldGroup}>
          <Text style={styles.label}>
            {f.label}
            {f.required !== false && <Text style={styles.required}> *</Text>}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={f.placeholder}
            placeholderTextColor="#dba1c4"
            value={values[f.key] || ''}
            onChangeText={(v) => onChange(f.key, v)}
            keyboardType={f.keyboardType || 'default'}
            maxLength={f.maxLength || 100}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={f.key === 'password'}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  fieldGroup: { gap: 4 },
  label: { fontSize: 13, fontWeight: '600', color: PINK_PASTEL.textPrimary, fontFamily: 'Sniglet_400Regular' },
  required: { color: '#EF4444' },
  input: {
    backgroundColor: PINK_PASTEL.input,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: PINK_PASTEL.textPrimary,
    fontFamily: 'Sniglet_400Regular',
    borderWidth: 1,
    borderColor: PINK_PASTEL.inputBorder,
  },
});

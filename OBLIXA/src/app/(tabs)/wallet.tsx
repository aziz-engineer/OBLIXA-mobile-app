// app/(tabs)/wallet.tsx
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export default function WalletScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Wallet — à compléter</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  text: { color: COLORS.textPrimary, fontSize: 16 },
});
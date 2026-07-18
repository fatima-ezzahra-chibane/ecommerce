import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';
import { WishlistProvider } from './src/contexts/WishlistContext';
import AppNavigator from './src/navigation/AppNavigator';
import WhatsAppButton from './src/components/WhatsAppButton';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <View style={styles.root}>
            <StatusBar style="dark" />
            <AppNavigator />
            <WhatsAppButton />
          </View>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

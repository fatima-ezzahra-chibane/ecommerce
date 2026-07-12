import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PINK } from '../config/api';

export default function Stars({ rating, size = 16 }) {
  const r = Math.round(Number(rating) || 0);
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Ionicons
          key={n}
          name={n <= r ? 'star' : 'star-outline'}
          size={size}
          color={n <= r ? PINK : '#e5e7eb'}
        />
      ))}
    </View>
  );
}

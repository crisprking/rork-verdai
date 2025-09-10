import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌱 FloraMind</Text>
      <Text style={styles.subtitle}>AI Plant Care Companion</Text>
      <Text style={styles.description}>Coming Soon to App Store!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#22C55E',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#16A34A',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
  },
});
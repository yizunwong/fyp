import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { saveToken, clearToken } from '../lib/auth';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Login failed');
      }
      const data = await res.json();
      await saveToken(data.access_token);
      Alert.alert('Logged in');
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Login error');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await clearToken();
    Alert.alert('Logged out');
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>Login</Text>
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 8, borderRadius: 6 }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 8, borderRadius: 6 }}
      />
      <Button title={loading ? 'Logging in...' : 'Login'} onPress={login} disabled={loading} />
      <View style={{ height: 12 }} />
      <Button title="Logout" color="#b00020" onPress={logout} />
    </View>
  );
}


import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { saveToken, clearToken } from '../lib/auth';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

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

  const loginWithGoogle = useCallback(async () => {
    // Where the backend should redirect back to after OAuth
    const redirectUrl = Linking.createURL('/oauth-callback');
    const authUrl = `http://localhost:3000/auth/google?redirect=${encodeURIComponent(
      redirectUrl,
    )}`;

    // Listen for redirect in case the browser returns to app
    const sub = Linking.addEventListener('url', async ({ url }) => {
      try {
        const parsed = Linking.parse(url);
        const token = parsed.queryParams?.token as string | undefined;
        if (token) {
          await saveToken(token);
          Alert.alert('Logged in with Google');
          router.replace('/(tabs)');
        }
      } catch {}
    });

    try {
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
      if (result.type === 'success' && result.url) {
        const parsed = Linking.parse(result.url);
        const token = parsed.queryParams?.token as string | undefined;
        if (token) {
          await saveToken(token);
          Alert.alert('Logged in with Google');
          router.replace('/(tabs)');
        }
      }
    } finally {
      sub.remove();
      // Ensure the auth session is dismissed on iOS
      WebBrowser.dismissBrowser();
    }
  }, [router]);

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
      <Button title="Continue with Google" color="#1a73e8" onPress={loginWithGoogle} />
      <View style={{ height: 12 }} />
      <Button title="Logout" color="#b00020" onPress={logout} />
    </View>
  );
}

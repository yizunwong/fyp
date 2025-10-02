import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { authFetch } from '../lib/auth';

export default function ProtectedScreen() {
  const [profile, setProfile] = useState<any>(null);

  const fetchProfile = async () => {
    try {
      const res = await authFetch('http://localhost:3000/profile');
      if (!res.ok) throw new Error('Unauthorized');
      const data = await res.json();
      setProfile(data);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to fetch profile');
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>Protected</Text>
      <Button title="Fetch /profile" onPress={fetchProfile} />
      {profile && (
        <View style={{ marginTop: 12 }}>
          <Text>User ID: {String(profile.userId)}</Text>
          <Text>Email: {String(profile.email)}</Text>
          <Text>Role: {String(profile.role)}</Text>
        </View>
      )}
    </View>
  );
}


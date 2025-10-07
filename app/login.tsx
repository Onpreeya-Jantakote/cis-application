import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { Button, Input } from '../components';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('ผิดพลาด', 'กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    
    if (result.success) {
      router.replace('/home');
    } else {
      Alert.alert('เข้าสู่ระบบล้มเหลว', result.message);
    }
    setLoading(false);
  };

  const useTestAccount = () => {
    setEmail('onpreeya@kkumail.com');
    setPassword('Momo123');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CIS App</Text>
        <Text style={styles.subtitle}>KKU Computer Science</Text>
      </View>
      
      <View style={styles.form}>
        <Input
          placeholder="อีเมล"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <Input
          placeholder="รหัสผ่าน"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <Button
          title={loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          onPress={handleLogin}
          disabled={loading}
        />

        {/* ปุ่มใช้บัญชีทดสอบ */}
        <TouchableOpacity style={styles.testAccountButton} onPress={useTestAccount}>
          <Text style={styles.testAccountText}>ใช้บัญชีทดสอบ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    width: '100%',
  },
  testAccountButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    alignItems: 'center',
  },
  testAccountText: {
    color: '#64748b',
    fontSize: 14,
  },
});
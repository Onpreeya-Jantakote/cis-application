import { useState, useEffect } from 'react';
import { authApi } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('🔐 Stored token:', token);

      if (!token || token === 'null' || token === 'undefined') {
        setLoading(false);
        return;
      }

      const response = await authApi.getProfile();
      setUser(response.data.data);
    } catch (error: any) {
      console.error('⚠️ Auth check error:', error);
      await AsyncStorage.multiRemove(['token', 'user']);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      console.log('🟢 Login response:', response.data);

      // ✅ ดึง token และข้อมูลผู้ใช้จาก response.data.data
      const data = response.data?.data;
      const token = data?.token;

      if (!token) {
        console.error('❌ No token received');
        throw new Error('No token received');
      }

      // ✅ เก็บ token และ user
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(data));

      console.log('✅ Token saved:', token);
      setUser(data);

      return { success: true, message: 'เข้าสู่ระบบสำเร็จ' };
    } catch (error: any) {
      console.error('🚨 Login error:', error.response?.data || error.message);

      let message = 'เข้าสู่ระบบล้มเหลว';
      if (error.response?.status === 401) {
        message = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
      } else if (error.response?.status === 403) {
        message = 'ไม่มีสิทธิ์ในการเข้าถึง';
      } else if (error.message?.includes('token')) {
        message = 'เซิร์ฟเวอร์ไม่ส่ง token กลับมา';
      }

      return { success: false, message };
    }
  };

  // ✅ เพิ่มฟังก์ชันอัพเดทโปรไฟล์
  const updateProfile = async (data: any) => {
    try {
      const response = await authApi.updateProfile(data);
      const updatedUser = response.data.data;
      
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { success: true, message: 'อัพเดทโปรไฟล์สำเร็จ' };
    } catch (error: any) {
      console.error('🚨 Update profile error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'อัพเดทโปรไฟล์ล้มเหลว' 
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'user']);
      setUser(null);
    } catch (error) {
      console.error('🚫 Logout error:', error);
    }
  };

  return { 
    user, 
    loading, 
    login, 
    logout, 
    updateProfile
  };
}
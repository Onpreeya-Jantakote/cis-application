import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://cis.kku.ac.th/api/classroom';
const API_KEY = '0e948e2fa3c5f377a8c51bfea1f3aa37d6f8d410be4e17eb02d656fb55d66bad';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  },
  timeout: 10000,
});

// ใช้ AsyncStorage แทน localStorage
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    // ตรวจสอบว่า token ไม่ใช่ null หรือ undefined
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error getting token:', error);
  }
  return config;
});

// Response interceptor เพื่อจัดการ error
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  async (error) => {
    console.error('❌ API Error:', error.config?.url, error.response?.status, error.message);
    
    if (error.response?.status === 401) {
      // Token หมดอายุหรือไม่ถูกต้อง
      await AsyncStorage.multiRemove(['token', 'user']);
    } else if (error.response?.status === 403) {
      // API Key ไม่ถูกต้องหรือไม่มีสิทธิ์
      console.error('API Key error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) => 
    api.post('/signin', { email, password }),
  
  getProfile: () => 
    api.get('/profile'),

  // ✅ เพิ่มการอัพเดทโปรไฟล์
  updateProfile: (data: any) => 
    api.patch('/profile', data),
};

export const statusApi = {
  getStatuses: () => 
    api.get('/status'),
  
  getStatus: (id: string) => 
    api.get(`/status/${id}`),
  
  createStatus: (content: string) => 
    api.post('/status', { content }),

  updateStatus: (id: string, content: string) => 
    api.patch(`/status/${id}`, { content }),

  // ✅ เพิ่มการลบโพสต์
  deleteStatus: (id: string) => 
    api.delete(`/status/${id}`),
  
  likeStatus: (statusId: string) => 
    api.post('/like', { statusId }),
  
  unlikeStatus: (statusId: string) => 
    api.delete('/unlike', { data: { statusId } }),
  
  addComment: (statusId: string, content: string) => 
    api.post('/comment', { statusId, content }),

  // ✅ เพิ่มการลบความคิดเห็น
  deleteComment: (id: string) => 
    api.delete(`/comment/${id}`),
};

export const classApi = {
  getClass: (id: string) => 
    api.get(`/class/${id}`),
};

// ✅ เพิ่ม API สำหรับโรงเรียน
export const schoolApi = {
  getSchools: () => 
    api.get('/school'),
  
  getSchool: (id: string) => 
    api.get(`/school/${id}`),
};

// ✅ เพิ่ม API สำหรับบริษัท
export const companyApi = {
  getCompanies: () => 
    api.get('/company'),
  
  getCompany: (id: string) => 
    api.get(`/company/${id}`),
};

// ✅ เพิ่ม API สำหรับอาจารย์
export const teacherApi = {
  getTeachers: () => 
    api.get('/teacher'),
};

// ✅ เพิ่ม API สำหรับจัดการงาน
export const jobApi = {
  getJobs: () => 
    api.get('/job'),
  
  createJob: (data: any) => 
    api.post('/job', data),
  
  updateJob: (id: string, data: any) => 
    api.patch(`/job/${id}`, data),
  
  deleteJob: (id: string) => 
    api.delete(`/job/${id}`),
};

export default api;
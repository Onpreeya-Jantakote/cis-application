import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'expo-router';

// ฟังก์ชันจัดการ avatar
const getAvatarSource = (user: any) => {
  if (user?.image) {
    return { uri: user.image };
  }
  return undefined;
};

const getInitials = (user: any) => {
  if (!user?.firstname || !user?.lastname) return '??';
  return `${user.firstname[0] || ''}${user.lastname[0] || ''}`;
};

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const router = useRouter();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    studentId: user?.education?.studentId || '',
  });
  const [updating, setUpdating] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/login');
          }
        },
      ]
    );
  };

  const handleEditProfile = () => {
    setEditData({
      firstname: user?.firstname || '',
      lastname: user?.lastname || '',
      studentId: user?.education?.studentId || '',
    });
    setEditModalVisible(true);
  };

  const saveProfile = async () => {
    if (!editData.firstname.trim() || !editData.lastname.trim()) {
      Alert.alert('Error', 'Please enter your first and last name');
      return;
    }

    setUpdating(true);
    try {
      const result = await updateProfile(editData);
      if (result.success) {
        Alert.alert('Success', result.message);
        setEditModalVisible(false);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>User not found</Text>
      </View>
    );
  }

  const avatarSource = getAvatarSource(user);
  const initials = getInitials(user);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {avatarSource ? (
                <Image source={avatarSource} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>
                {user.firstname} {user.lastname}
              </Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userId}>Student ID: {user.education.studentId}</Text>
              <Text style={styles.userYear}>Enrollment Year: {user.education.enrollmentYear}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <MaterialCommunityIcons name="pencil" size={16} color="#64748b" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="information" size={20} color="#1e40af" />
            <Text style={styles.sectionTitle}>Information</Text>
          </View>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="email" size={18} color="#64748b" />
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="identifier" size={18} color="#64748b" />
              <Text style={styles.infoLabel}>Student ID:</Text>
              <Text style={styles.infoValue}>{user.education.studentId}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="calendar" size={18} color="#64748b" />
              <Text style={styles.infoLabel}>Enrollment Year:</Text>
              <Text style={styles.infoValue}>{user.education.enrollmentYear}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="book-education" size={18} color="#64748b" />
              <Text style={styles.infoLabel}>Major:</Text>
              <Text style={styles.infoValue}>{user.education.major}</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#dc2626" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Joined on {new Date(user.createdAt).toLocaleDateString('th-TH')}
          </Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput
                  style={styles.input}
                  value={editData.firstname}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, firstname: text }))}
                  placeholder="First Name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={editData.lastname}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, lastname: text }))}
                  placeholder="Last Name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Student ID</Text>
                <TextInput
                  style={styles.input}
                  value={editData.studentId}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, studentId: text }))}
                  placeholder="Student ID"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, updating && styles.saveButtonDisabled]}
                onPress={saveProfile}
                disabled={updating}
              >
                <Text style={styles.saveButtonText}>
                  {updating ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#1e40af',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarFallback: {
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#64748b',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 4,
  },
  userId: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  userYear: {
    fontSize: 14,
    color: '#374151',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  editButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8fafc',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#1e40af',
  },
  saveButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  saveButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
});
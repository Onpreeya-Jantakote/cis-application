import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { classApi } from '../../services/api';
import { User } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const ACADEMIC_YEARS = ['2565', '2566', '2567', '2568', '2569'];

// ฟังก์ชันจัดการ avatar
const getAvatarSource = (user: User) => {
  if (user?.image) {
    return { uri: user.image };
  }
  return undefined;
};

// ฟังก์ชันดึงชื่อย่อ
const getInitials = (user: User) => {
  if (!user?.firstname || !user?.lastname) return '??';
  return `${user.firstname[0] || ''}${user.lastname[0] || ''}`;
};

export default function Members() {
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState<User[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<User[]>([]);
  const [selectedYear, setSelectedYear] = useState('2565');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMembers();
  }, [selectedYear]);

  useEffect(() => {
    filterMembers();
  }, [searchQuery, members]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const response = await classApi.getClass(selectedYear);
      if (response.data?.data) {
        setMembers(response.data.data);
      } else {
        setMembers([]);
        Alert.alert('ข้อมูล', 'ไม่พบข้อมูลสมาชิกในปีนี้');
      }
    } catch (error: any) {
      console.error('Error loading members:', error);
      Alert.alert('ผิดพลาด', 'ไม่สามารถโหลดข้อมูลสมาชิกได้');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    if (!searchQuery.trim()) {
      setFilteredMembers(members);
      return;
    }

    const filtered = members.filter(member =>
      member.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.education.studentId.includes(searchQuery)
    );
    setFilteredMembers(filtered);
  };

  const renderMemberCard = (member: User) => {
    const avatarSource = getAvatarSource(member);
    const initials = getInitials(member);
    const isCurrentUser = currentUser?._id === member._id;

    return (
      <View key={member._id} style={styles.memberCard}>
        <View style={styles.memberHeader}>
          <View style={styles.avatarContainer}>
            {avatarSource ? (
              <Image source={avatarSource} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            {isCurrentUser && (
              <View style={styles.currentUserBadge}>
                <Text style={styles.currentUserText}>คุณ</Text>
              </View>
            )}
          </View>
          
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>
              {member.firstname} {member.lastname}
              {isCurrentUser && <Text style={styles.youIndicator}> (คุณ)</Text>}
            </Text>
            <Text style={styles.memberId}>รหัส: {member.education.studentId}</Text>
            <Text style={styles.memberYear}>ปีที่เข้า: {member.education.enrollmentYear}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>สมาชิก CIS</Text>
        <Text style={styles.headerSubtitle}>เพื่อนร่วมชั้นเรียน</Text>
      </View>

      {/* Year Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.yearFilter}
      >
        {ACADEMIC_YEARS.map((year) => (
          <TouchableOpacity
            key={year}
            style={[
              styles.yearButton,
              selectedYear === year && styles.yearButtonActive
            ]}
            onPress={() => setSelectedYear(year)}
          >
            <Text style={[
              styles.yearButtonText,
              selectedYear === year && styles.yearButtonTextActive
            ]}>
              ปี {year}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#64748b" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="ค้นหาด้วยชื่อหรือรหัสนักศึกษา..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{filteredMembers.length}</Text>
          <Text style={styles.statLabel}>ทั้งหมด</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {filteredMembers.filter(m => m._id === currentUser?._id).length}
          </Text>
          <Text style={styles.statLabel}>คุณ</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {filteredMembers.filter(m => m._id !== currentUser?._id).length}
          </Text>
          <Text style={styles.statLabel}>เพื่อน</Text>
        </View>
      </View>

      {/* Members List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e40af" />
          <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.membersList}
          showsVerticalScrollIndicator={false}
        >
          {filteredMembers.length > 0 ? (
            filteredMembers.map(renderMemberCard)
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-group-outline" size={64} color="#94a3b8" />
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'ไม่พบสมาชิกที่ค้นหา' : 'ไม่พบสมาชิกในปีนี้'}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  yearFilter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  yearButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  yearButtonActive: {
    backgroundColor: '#1e40af',
  },
  yearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  yearButtonTextActive: {
    color: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8fafc',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  membersList: {
    flex: 1,
    padding: 16,
  },
  memberCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarFallback: {
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748b',
  },
  currentUserBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#10b981',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  currentUserText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  youIndicator: {
    color: '#10b981',
    fontSize: 14,
  },
  memberId: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  memberYear: {
    fontSize: 12,
    color: '#94a3b8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748b',
    marginTop: 16,
    textAlign: 'center',
  },
});
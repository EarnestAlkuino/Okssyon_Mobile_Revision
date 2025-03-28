import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Header from '../Components/Header';
import { supabase } from '../supabase'; // Import your Supabase client

const SettingsPage = ({ navigation, setUnreadCount, setNotifications, setUserName }) => {
  // Logout handler
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();

      // Clear the states passed down as props
      setUnreadCount(0);  // Clear unread count
      setNotifications([]);  // Reset notifications list
      setUserName('');  // Clear user data

      // Navigate to LoginPage after logout
      navigation.navigate('LoginPage');
    } catch (error) {
      console.error('❌ Error during logout:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Component */}
      <Header
        title="Settings"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        showSettingsButton={false}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* General Section */}
        <Text style={styles.sectionTitle}>General</Text>
        {[{ label: 'Account', icon: 'person-outline', target: 'AccountPage' }].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.listItem}
            onPress={() => (item.target ? navigation.navigate(item.target) : item.action())}
          >
            <View style={styles.listItemContent}>
              <Ionicons name={item.icon} size={22} color="#34495E" />
              <Text style={styles.listItemText}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="#A0A0A0" />
          </TouchableOpacity>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 12,
    marginTop: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemText: {
    fontSize: 16,
    color: '#34495E',
    marginLeft: 10,
  },
  logoutButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default SettingsPage;

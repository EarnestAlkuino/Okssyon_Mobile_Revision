import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const NotificationPage = () => {
  const [activeTab, setActiveTab] = useState('Recent');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification</Text>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'Recent' ? styles.activeTab : styles.inactiveTab,
          ]}
          onPress={() => handleTabChange('Recent')}
        >
          <Text style={activeTab === 'Recent' ? styles.activeTabText : styles.inactiveTabText}>
            Recent
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'All Notifications' ? styles.activeTab : styles.inactiveTab,
          ]}
          onPress={() => handleTabChange('All Notifications')}
        >
          <Text style={activeTab === 'All Notifications' ? styles.activeTabText : styles.inactiveTabText}>
            All Notifications
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.contentText}>
          {activeTab === 'Recent' ? 'Showing Recent Notifications' : 'Showing All Notifications'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#F5F5F5', // Light background
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#008CBA', // Active tab color
  },
  inactiveTab: {
    backgroundColor: '#E0E0E0', // Inactive tab color
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  inactiveTabText: {
    color: '#000000',
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentText: {
    fontSize: 18,
  },
});

export default NotificationPage;

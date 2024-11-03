import React, { useState, useEffect, useCallback } from 'react'; 
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import Header from '../Components/Header';
import { supabase } from '../supabase';

const NotificationPage = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Recent');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const hideSplashScreen = async () => {
      await SplashScreen.hideAsync();
    };
    hideSplashScreen();

    // Fetch notifications on mount and refetch on screen focus
    const unsubscribe = navigation.addListener('focus', fetchNotifications);
    fetchNotifications();

    return unsubscribe;
  }, [navigation]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      if (user) {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id) // Using the fetched user ID
          .order('created_at', { ascending: false });
  
        if (error) throw error;
        setNotifications(data || []);
      } else {
        console.log("No authenticated user found.");
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleNotificationPress = (notification) => {
    // Direct to details page based on notification type
    if (notification.auction_id) {
      navigation.navigate('LivestockAuctionDetailPage', { itemId: notification.auction_id });
    } else {
      console.log('No associated transaction for this notification.');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleNotificationPress(item)}>
      <View style={styles.notificationItem}>
        <Text style={styles.notificationText}>{item.message}</Text>
        <Text style={styles.notificationDate}>{new Date(item.created_at).toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header 
        title="Notifications"
        showBackButton={true}
        showSettingsButton={false}
        onBackPress={handleBackPress}
      />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Recent' ? styles.activeTab : styles.inactiveTab]}
          onPress={() => handleTabChange('Recent')}
        >
          <Text style={activeTab === 'Recent' ? styles.activeTabText : styles.inactiveTabText}>
            Recent
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'All Notifications' ? styles.activeTab : styles.inactiveTab]}
          onPress={() => handleTabChange('All Notifications')}
        >
          <Text style={activeTab === 'All Notifications' ? styles.activeTabText : styles.inactiveTabText}>
            All Notifications
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {loading ? (
          <Text>Loading...</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <FlatList
            data={activeTab === 'Recent' ? notifications.slice(0, 5) : notifications}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderNotificationItem}
            ListEmptyComponent={<Text>No notifications to show.</Text>}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    margin: 15,
    borderRadius: 25,
    padding: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 25,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#257446',
  },
  inactiveTab: {
    backgroundColor: 'transparent',
  },
  activeTabText: {
    color: '#257446',
    fontWeight: '600',
  },
  inactiveTabText: {
    color: '#000000',
    fontWeight: '400',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  notificationItem: {
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  notificationText: {
    fontSize: 16,
    color: '#333',
  },
  notificationDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default NotificationPage;

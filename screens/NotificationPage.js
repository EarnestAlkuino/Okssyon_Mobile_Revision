import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import Header from '../Components/Header';
import { supabase } from '../supabase';

const NotificationPage = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Recent');
  const [notifications, setNotifications] = useState([]); 
  const [announcements, setAnnouncements] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getNotificationPermissions = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    };
    getNotificationPermissions();
  }, []);

  useEffect(() => {
    const hideSplashScreen = async () => {
      await SplashScreen.hideAsync();
    };
    hideSplashScreen();

    // Fetch initial data
    fetchNotifications();
    fetchAnnouncements();

    // Real-time listener for notifications
    const notificationChannel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, async (payload) => {
        const { message } = payload.new;
        await sendPushNotification('New Notification', message);
        setNotifications((prevNotifications) => [payload.new, ...prevNotifications]);
      })
      .subscribe();

    // Real-time listener for announcements
    const announcementChannel = supabase
      .channel('announcements')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, async (payload) => {
        const { text } = payload.new;
        await sendPushNotification('New Announcement', text);
        setAnnouncements((prevAnnouncements) => [payload.new, ...prevAnnouncements]);
      })
      .subscribe();

    // Clean up listeners on unmount
    return () => {
      supabase.removeChannel(notificationChannel);
      supabase.removeChannel(announcementChannel);
    };
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData?.session) {
        setError("User not logged in");
        setLoading(false);
        return;
      }
  
      const userId = sessionData.session.user.id;
  
      const { data: sellerNotifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('seller_id', userId)
        .eq('recipient_role', 'SELLER')
        .order('created_at', { ascending: false });
  
      const { data: bidderNotifications } = await supabase
        .from('notifications')
        .select('*, notification_bidders!inner(bidder_id)')
        .eq('notification_bidders.bidder_id', userId)
        .eq('recipient_role', 'BIDDER')
        .order('created_at', { ascending: false });
  
      const combinedNotifications = [...(sellerNotifications || []), ...(bidderNotifications || [])];
      combinedNotifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setNotifications(combinedNotifications);
    } catch (err) {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError("Failed to load announcements");
    } else {
      setAnnouncements(data);
    }
  };

  // Helper function to send a push notification
  const sendPushNotification = async (title, message) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
        },
        trigger: null,
      });
      console.log("Push notification sent successfully.");
    } catch (error) {
      console.error("Failed to send push notification:", error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleNotificationPress = async (item) => {
    if (item.notification_id && !item.is_read) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('notification_id', item.notification_id);
      fetchNotifications();
    }

    if (item.livestock_id) {
      navigation.navigate('LivestockAuctionDetailPage', { itemId: item.livestock_id });
    }
  };

  const renderNotificationItem = ({ item }) => {
    const isAnnouncement = item.id && !item.notification_id; // Distinguish between announcement and notification

    return (
      <TouchableOpacity
        onPress={() => !isAnnouncement && handleNotificationPress(item)}
        style={styles.notificationItemContainer}
      >
        <View style={[styles.notificationItem, item.is_read ? {} : styles.unreadNotification]}>
          <Text style={styles.contentText}>
            {isAnnouncement ? item.text : item.message}
          </Text>
          <Text style={styles.timestampText}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
    fetchAnnouncements();
    setRefreshing(false);
  };

  const unreadCount = notifications.filter((notif) => !notif.is_read).length;
  const allItems = [...notifications, ...announcements];
  const filteredItems = activeTab === 'Recent' ? allItems.slice(0, 5) : allItems;

  return (
    <View style={styles.container}>
      <Header 
        title="Notifications"
        showBackButton={false}
        showSettingsButton={false}
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Recent' ? styles.activeTab : styles.inactiveTab]}
          onPress={() => handleTabChange('Recent')}
        >
          <Text style={activeTab === 'Recent' ? styles.activeTabText : styles.inactiveTabText}>
            Recent {unreadCount > 0 ? `(${unreadCount})` : ''}
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
      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#257446" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.notification_id || item.id.toString()}
            renderItem={renderNotificationItem}
            ListEmptyComponent={<Text style={styles.noNotificationsText}>No notifications available</Text>}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderColor: '#257446',
  },
  inactiveTab: {
    borderBottomWidth: 1,
    borderColor: 'transparent',
  },
  activeTabText: {
    color: '#257446',
    fontWeight: '600',
  },
  inactiveTabText: {
    color: '#6B7280',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  notificationItemContainer: {
    marginBottom: 10,
  },
  notificationItem: {
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: '#EBF8EB',
  },
  contentText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  timestampText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  noNotificationsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6B7280',
    marginTop: 20,
  },
});

export default NotificationPage;

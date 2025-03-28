import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator, SafeAreaView, StatusBar, Alert } from 'react-native';
import { supabase } from '../supabase';  // Import your Supabase client
import { Ionicons } from '@expo/vector-icons';

const NotificationPage = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('Unread');
  const [unreadCount, setUnreadCount] = useState(0);

  const calculateUnreadCount = (notifications) => {
    if (!notifications || notifications.length === 0) return 0;
    return notifications.filter(notif => {
      // Handle both direct and nested notification structures
      const isRead = notif.is_read ?? notif.notifications?.is_read ?? false;
      return !isRead;
    }).length;
  };

  const fetchNotifications = async () => {
    setRefreshing(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) throw new Error('User is not authenticated.');
  
      // ✅ Fetch Seller Notifications (only for auction owners)
      const { data: sellerNotifications, error: sellerError } = await supabase
        .from('notifications')
        .select('id, livestock_id, message, created_at, is_read, notification_type, seller_id')
        .eq('seller_id', userId)
        .neq('notification_type', 'AUCTION_ENDED_OWNER')
        .order('created_at', { ascending: false });

      if (sellerError) {
        console.error('❌ Error fetching seller notifications:', sellerError.message);
      }
  
      // ✅ Fetch Bidder Notifications (for users placing bids)
      const { data: bidderNotifications, error: bidderError } = await supabase
        .from('notification_bidders')
        .select(`
          id, notification_id, bidder_id, is_read, created_at, notification_type,
          notifications:notification_id (id, livestock_id, message, created_at, notification_type)
        `)
        .eq('bidder_id', userId) // ✅ Ensures only bidder notifications are fetched
        .order('created_at', { ascending: false });
  
      if (bidderError) {
        console.error('❌ Error fetching bidder notifications:', bidderError.message);
      }
  
      // ✅ Fetch Winner Notifications (only for the auction winner)
      const { data: winnerNotifications, error: winnerError } = await supabase
        .from('winner_notifications')
        .select('id, livestock_id, message, created_at, is_read, notification_type, role, winner_id')
        .eq('winner_id', userId) // ✅ Ensures only the correct winner gets their notifications
        .eq('role', 'bidder') // ✅ Ensures this only applies to bidders
        .order('created_at', { ascending: false });
  
      if (winnerError) {
        console.error('❌ Error fetching winner notifications:', winnerError.message);
      }
  
      // ✅ Fetch `NEW_AUCTION` Notifications for Bidders
      const { data: newAuctionNotifications, error: newAuctionError } = await supabase
        .from('notification_bidders')
        .select(`
          id, 
          notification_id, 
          bidder_id, 
          is_read, 
          created_at, 
          notification_type,
          notifications:notification_id (
            id,
            livestock_id,
            message
          )
        `)
        .eq('bidder_id', userId)
        .eq('notification_type', 'NEW_AUCTION')
        .order('created_at', { ascending: false });
  
      if (newAuctionError) {
        console.error('❌ Error fetching NEW_AUCTION notifications:', newAuctionError.message);
      }
  
      const removeDuplicates = (notifications) => {
        const seen = new Set();
        return notifications.filter(notif => {
          const notification = notif.notifications ? notif.notifications : notif;
          const id = notification.id || notif.id;
          const type = notification.notification_type || notif.notification_type;
          const created = notification.created_at || notif.created_at;
          
          const key = `${id}-${type}-${created}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      };

      const combinedNotifications = removeDuplicates([
        ...(sellerNotifications || []).map(notif => ({
          ...notif,
          userType: 'seller'
        })),
        ...(bidderNotifications || []).map(notif => {
          const notification = notif.notifications || {};
          return {
            id: notif.notification_id || notif.id,
            livestock_id: notification.livestock_id,
            message: notification.message,
            created_at: notification.created_at || notif.created_at,
            is_read: notif.is_read,
            notification_type: notification.notification_type || notif.notification_type,
            userType: 'bidder'
          };
        }),
        ...(winnerNotifications || []).map(notif => ({
          ...notif,
          userType: 'winner'
        })),
      ]);

      combinedNotifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setNotifications(combinedNotifications);
      setUnreadCount(calculateUnreadCount(combinedNotifications));
    } catch (err) {
      console.error('❌ Failed to fetch notifications:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    const getUserId = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      return sessionData?.session?.user?.id || null;
    };
  
    const subscribeToNotifications = async () => {
      const userId = await getUserId();
      if (!userId) return;
  
      console.log("✅ Subscribing to notifications for user:", userId);
  
      const sellerNotifChannel = supabase
        .channel('seller_notifications_realtime')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'notifications',
            filter: `seller_id=eq.${userId}`
          }, 
          (payload) => {
            if (payload.new.seller_id === userId) {
              console.log("🔔 New seller notification:", payload);
              setNotifications((prev) => [{
                ...payload.new,
                userType: 'seller'
              }, ...prev]);
            }
        })
        .subscribe();
  
      const bidderNotifChannel = supabase
        .channel('bidder_notifications_realtime')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'notification_bidders',
            filter: `bidder_id=eq.${userId}`
          }, 
          (payload) => {
            if (payload.new.bidder_id === userId) {
              console.log("🔔 New bidder notification:", payload);
              setNotifications((prev) => [{
                ...payload.new,
                userType: 'bidder'
              }, ...prev]);
            }
        })
        .subscribe();
  
      const winnerNotifChannel = supabase
        .channel('winner_notifications_realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'winner_notifications' }, (payload) => {
          console.log("🏆 New winner notification:", payload);
          setNotifications((prev) => [payload.new, ...prev]);
        })
        .subscribe();
  
      const newAuctionNotifChannel = supabase
        .channel('new_auction_notifications_realtime')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'notification_bidders',
            filter: `bidder_id=eq.${userId}`
          }, 
          (payload) => {
            console.log("📢 New auction notification received:", payload);
          })
        .subscribe();
  
      return () => {
        console.log("🛑 Unsubscribing from notifications...");
        supabase.removeChannel(sellerNotifChannel);
        supabase.removeChannel(bidderNotifChannel);
        supabase.removeChannel(winnerNotifChannel);
        supabase.removeChannel(newAuctionNotifChannel);
      };
    };
  
    subscribeToNotifications();
    fetchNotifications();
  }, []);
  
  const handleNotificationPress = (item) => {
    if (!item || !item.notification_type) {
      console.warn('⚠ Invalid notification item:', item);
      return;
    }
  
    console.log('📌 Navigating based on notification type:', item.notification_type, item);
  
    const isBidRelated = ['NEW_BID', 'OUTBID', 'BID_PLACED', 'BID_CONFIRMED'].includes(item.notification_type);
    if (isBidRelated && item.status === 'AUCTION_ENDED') {
      Alert.alert('Auction Ended', 'Bidding is no longer allowed.');
      return;
    }
  
    markNotificationAsRead(item.id);
  
    switch (item.notification_type) {
      case 'AUCTION_ENDED_WINNER':
        navigation.navigate('WinnerConfirmationPage', { livestockId: item.livestock_id });
        break;
  
      case 'AUCTION_CONFIRMED':
        navigation.navigate('SellerTransactionPage', { livestockId: item.livestock_id });
        break;
  
      case 'PROOF_SENT_TO_BIDDER':
      case 'VET_CERT_SENT_TO_BIDDER':
        navigation.navigate('BidderTransactionPage', { livestockId: item.livestock_id });
        break;
  
      case 'FORUM_QUESTION':
      case 'FORUM_ANSWER':
        if (!item.livestock_id) {
          console.error("🚨 Missing `livestock_id` in notification item:", item);
          return;
        }
        navigation.navigate('ForumPage', { 
          livestockId: item.livestock_id, 
          threadId: item.thread_id || null, 
          notificationType: item.notification_type 
        });
        break;
  
      default:
        navigation.navigate('LivestockAuctionDetailPage', { itemId: item.livestock_id });
        break;
    }
  };
  
  const markNotificationAsRead = async (id) => {
    try {
      // Update in database
      await Promise.all([
        supabase.from('notifications').update({ is_read: true }).eq('id', id),
        supabase.from('notification_bidders').update({ is_read: true }).eq('notification_id', id),
        supabase.from('winner_notifications').update({ is_read: true }).eq('id', id)
      ]);

      // Update local state
      setNotifications(prevNotifications => {
        const updated = prevNotifications.map(notif => 
          (notif.id === id || notif.notification_id === id) ? { ...notif, is_read: true } : notif
        );
        
        // Recalculate unread count from the updated notifications
        const newUnreadCount = updated.filter(notif => !notif.is_read).length;
        setUnreadCount(newUnreadCount);
        
        return updated;
      });
    } catch (error) {
      console.error('❌ Error marking notification as read:', error.message);
    }
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderNotificationItem = ({ item }) => {
    const message = item.message || 'No message available';
    const notificationType = item.notification_type || 'Unknown';
    const createdAt = item.created_at ? new Date(item.created_at).toLocaleString() : 'Unknown time';
    const livestockId = item.livestock_id || 'Unknown livestock';

    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        style={[styles.notificationCard, item.is_read ? styles.readNotification : styles.unreadNotification]}
      >
        {!item.is_read && <View style={styles.unreadIndicator} />}
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationMessage, !item.is_read && styles.notificationMessageUnread]} numberOfLines={2}>
            {message}
          </Text>
          <Text style={styles.notificationTime}>{createdAt}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredNotifications = useMemo(() => {
    return activeTab === 'Unread' 
      ? notifications.filter(notif => !notif.is_read)
      : notifications;
  }, [notifications, activeTab]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#234D35" barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Unread' && styles.activeTab]}
          onPress={() => handleTabChange('Unread')}
        >
          <Text style={[styles.tabText, activeTab === 'Unread' && styles.activeTabText]}>
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'All' && styles.activeTab]}
          onPress={() => handleTabChange('All')}
        >
          <Text style={[styles.tabText, activeTab === 'All' && styles.activeTabText]}>All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id ? item.id.toString() : String(item.id)}
        renderItem={renderNotificationItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchNotifications} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No Notifications Available</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { backgroundColor: '#234D35', flexDirection: 'row', alignItems: 'center', paddingTop: 40, paddingBottom: 16, paddingHorizontal: 16 },
  headerTitle: { color: 'white', fontSize: 18, marginLeft: 12, fontWeight: 'bold' },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#E8F5E9', borderRadius: 10, marginHorizontal: 12, padding: 5 },
  tab: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 8 },
  activeTab: { backgroundColor: '#234D35' },
  tabText: { fontSize: 14, color: '#234D35' },
  activeTabText: { color: 'white', fontWeight: 'bold' },
  notificationCard: { margin: 8, padding: 12, borderRadius: 10, backgroundColor: '#FFF', elevation: 2 },
  notificationContent: { flex: 1 },
  notificationMessage: { fontSize: 14, color: '#555' },
  notificationMessageUnread: { fontWeight: 'bold' },
  notificationTime: { fontSize: 12, color: '#888' },
  unreadIndicator: { width: 4, backgroundColor: '#234D35', borderRadius: 2, marginRight: 10 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#888' },
  readNotification: { backgroundColor: '#e0f7fa' },
  unreadNotification: { backgroundColor: '#ffffff' },
});

export default NotificationPage;
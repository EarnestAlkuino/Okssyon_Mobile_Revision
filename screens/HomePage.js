import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { supabase } from '../supabase';
import HomeHeader from '../Components/Home/HomeHeader';
import CategoryGrid from '../Components/Home/CategoryGrid';
import AnnouncementBanner from '../Components/Home/AnnouncementBanner';
import GradientButton from '../Components/Home/GradientButton';

const HomePage = ({ navigation, route }) => {
  const { userId: userIdFromRoute } = route.params || {};
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      let userId = userIdFromRoute;

      if (!userId) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          Alert.alert('Error', userError?.message || 'No user found. Please log in again.');
          navigation.navigate('LoginPage');
          return;
        }
        userId = user.id;
      }

      // Fetch user's profile name
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      if (profileError) {
        Alert.alert('Error fetching profile data', profileError.message);
      } else {
        setUserName(profileData.full_name);
      }

      // Fetch latest announcements
      const { data: announcementData, error: announcementError } = await supabase
        .from('announcements')
        .select('text, date')
        .order('date', { ascending: false })
        .limit(4);

      if (announcementError) {
        Alert.alert('Error fetching announcements', announcementError.message);
      } else {
        setAnnouncements(announcementData);
      }

      // Fetch unread notifications
      fetchUnreadNotifications(userId);

      setLoading(false);
    };

    fetchData();

    // Set up real-time listener
    const channel = setupRealTimeListener();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userIdFromRoute, navigation]);

  /**
   * ✅ Fetch unread notifications from both `notifications` and `notification_bidders` tables.
   */
  const fetchUnreadNotifications = async (userId) => {
    try {
      // Fetch only unread notifications with better filters
      const [
        { data: sellerNotifications, error: sellerError },
        { data: bidderNotifications, error: bidderError },
        { data: winnerNotifications, error: winnerError }
      ] = await Promise.all([
        supabase
          .from('notifications')
          .select('id')
          .eq('seller_id', userId)
          .eq('is_read', false)
          .not('id', 'is', null), // Ensure valid notifications only

        supabase
          .from('notification_bidders')
          .select('id')
          .eq('bidder_id', userId)
          .eq('is_read', false)
          .not('id', 'is', null), // Ensure valid notifications only

        supabase
          .from('winner_notifications')
          .select('id')
          .eq('winner_id', userId)
          .eq('is_read', false)
          .not('id', 'is', null) // Ensure valid notifications only
      ]);

      if (sellerError) console.error('Seller notifications error:', sellerError);
      if (bidderError) console.error('Bidder notifications error:', bidderError);
      if (winnerError) console.error('Winner notifications error:', winnerError);

      // Calculate total unread only if there are actual notifications
      const totalUnread = 
        ((sellerNotifications && sellerNotifications.length) || 0) +
        ((bidderNotifications && bidderNotifications.length) || 0) +
        ((winnerNotifications && winnerNotifications.length) || 0);

      console.log('📊 Unread counts:', {
        seller: sellerNotifications?.length || 0,
        bidder: bidderNotifications?.length || 0,
        winner: winnerNotifications?.length || 0,
        total: totalUnread
      });

      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('❌ Error fetching unread notifications:', error.message);
      setUnreadCount(0); // Reset count on error
    }
  };

  /**
   * ✅ Mark notification as read and update badge count.
   */
  const markNotificationAsRead = async (id) => {
    try {
      // ✅ Update notification as read
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      await supabase.from('notification_bidders').update({ is_read: true }).eq('notification_id', id);
      await supabase.from('winner_notifications').update({ is_read: true }).eq('id', id);

      // ✅ Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // ✅ Fetch latest unread count
      fetchUnreadNotifications(userIdFromRoute);
    } catch (error) {
      console.error('❌ Error marking notification as read:', error.message);
    }
  };

  /**
   * ✅ Real-time listener for notifications (updates badge count).
   */
  const setupRealTimeListener = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Error fetching user:', authError);
      return;
    }

    const channel = supabase
      .channel('notifications-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          if (payload.new.seller_id === user.id && !payload.new.is_read) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notification_bidders' },
        (payload) => {
          if (payload.new.bidder_id === user.id && !payload.new.is_read) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'winner_notifications' },
        (payload) => {
          if (payload.new.winner_id === user.id && !payload.new.is_read) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return channel;
  };

  /**
   * ✅ Ensure the badge count updates when returning to HomePage.
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUnreadNotifications(userIdFromRoute);
    });
    return unsubscribe;
  }, [navigation, userIdFromRoute]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#405e40" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HomeHeader
        name={userName}
        unreadCount={unreadCount}
        onNotificationPress={() => navigation.navigate('NotificationPage')}
      />
      <AnnouncementBanner announcements={announcements} />
      <GradientButton text="View latest PNS" onPress={() => navigation.navigate('PnsPage')} />
      <Text style={styles.selectionLabel}>Livestock Auction Selection</Text>
      <CategoryGrid navigation={navigation} userId={userIdFromRoute} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionLabel: {
    textAlign: 'left',
    fontSize: 20,
    color: '#405e40',
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 10,
  },
});

export default HomePage;
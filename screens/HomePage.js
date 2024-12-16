import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { supabase } from '../supabase';
import HomeHeader from '../Components/Home/HomeHeader'; // Custom header component
import CategoryGrid from '../Components/Home/CategoryGrid'; // Livestock categories component
import AnnouncementBanner from '../Components/Home/AnnouncementBanner'; // Announcements component
import GradientButton from '../Components/Home/GradientButton'; // Button component

const HomePage = ({ navigation, route }) => {
  const { userId: userIdFromRoute } = route.params || {};
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0); // Notification badge count
  const flatListRef = useRef(null);
  const currentIndex = useRef(0);

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

      const { data: notifications, error: notificationError } = await supabase
        .from('notifications')
        .select('is_read, recipient_id')
        .eq('recipient_id', userId)
        .eq('is_read', false);

      if (notificationError) {
        console.error('Error fetching unread notifications:', notificationError);
      } else {
        setUnreadCount(notifications.length);
      }

      setLoading(false);
    };

    fetchData();

    const setupRealTimeListener = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('Error fetching user:', authError);
        return;
      }

      const channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications' },
          (payload) => {
            if (payload.new.recipient_id === user.id && !payload.new.is_read) {
              setUnreadCount((prev) => prev + 1);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'notifications' },
          (payload) => {
            if (payload.new.recipient_id === user.id && payload.new.is_read) {
              setUnreadCount((prev) => Math.max(0, prev - 1));
            }
          }
        )
        .subscribe();

      return channel;
    };

    const channel = setupRealTimeListener();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userIdFromRoute, navigation]);

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

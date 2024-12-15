import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, Dimensions, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import HomePage from '../screens/HomePage';
import PostPage from '../screens/PostPage';
import NotificationPage from '../screens/NotificationPage';
import ProfilePage from '../screens/ProfilePage';
import { supabase } from '../supabase'; // Import Supabase client

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const BottomTabNavigator = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          console.error('Error fetching user:', authError);
          return;
        }

        // Fetch unread notifications only for the logged-in user
        const { data, error } = await supabase
          .from('notifications')
          .select('is_read, recipient_id')
          .eq('recipient_id', user.id) // Ensure notifications are for the logged-in user
          .eq('is_read', false);

        if (error) {
          console.error('Error fetching unread notifications:', error);
        } else {
          setUnreadCount(data.length); // Set the unread count
        }
      } catch (error) {
        console.error('Unexpected error fetching notifications:', error.message);
      }
    };

    fetchUnreadNotifications();

    // Real-time listener for notifications
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
            console.log('New notification received:', payload);
            if (payload.new.recipient_id === user.id && !payload.new.is_read) {
              // Only increment unread count for the logged-in user
              setUnreadCount((prev) => prev + 1);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'notifications' },
          (payload) => {
            console.log('Notification updated:', payload);
            if (payload.new.recipient_id === user.id && payload.new.is_read) {
              // Only decrement unread count for the logged-in user
              setUnreadCount((prev) => Math.max(0, prev - 1));
            }
          }
        )
        .subscribe();

      return channel;
    };

    const channel = setupRealTimeListener();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let iconName;
          const iconSize = 28;
          const iconColor = focused ? '#405e40' : '#405e40'; // Dark green color for both states

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Post':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'Notification':
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'circle-outline';
          }

          return (
            <View style={{ position: 'relative' }}>
              <Icon name={iconName} size={iconSize} color={iconColor} />
              {route.name === 'Notification' && unreadCount > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
          );
        },
        tabBarLabel: ({ focused }) => (
          <Text style={focused ? styles.tabBarLabelFocused : styles.tabBarLabel}>
            {route.name}
          </Text>
        ),
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBarStyle,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="Post" component={PostPage} />
      <Tab.Screen name="Notification" component={NotificationPage} />
      <Tab.Screen name="Profile" component={ProfilePage} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarStyle: {
    height: 80,
    backgroundColor: '#e0f5e0',
    paddingBottom: 12,
    paddingTop: 10,
    borderRadius: 0,
    borderTopWidth: 0,
    marginHorizontal: 0,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarLabel: {
    color: '#405e40',
    fontSize: 12,
  },
  tabBarLabelFocused: {
    color: '#405e40',
    fontSize: 12,
    fontWeight: '600',
  },
  badgeContainer: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: '#FF0000',
    borderRadius: 12,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default BottomTabNavigator;

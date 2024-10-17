import React from 'react';
import { Text } from 'react-native'; // Import Text from react-native
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import HomePage from '../screens/HomePage';
import MessagePage from '../screens/MessagePage';
import PostPage from '../screens/PostPage';
import NotificationPage from '../screens/NotificationPage';
import ProfilePage from '../screens/ProfilePage';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let iconName;
          let iconSize = 28;  // Keep all icons the same size
          let iconColor = focused ? '#fff' : '#A0A0A0';

          // Define icons based on the route name
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Message':
              iconName = focused ? 'chatbubble' : 'chatbubble-outline';
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

          // Conditional rendering for highlighted icon with gradient background
          if (focused) {
            return (
              <LinearGradient
                colors={['#ffba08', '#ff9a76']}
                style={{
                  width: iconSize + 18,
                  height: iconSize + 18,
                  borderRadius: (iconSize + 18) / 2,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name={iconName} size={iconSize} color={iconColor} />
              </LinearGradient>
            );
          } else {
            return <Icon name={iconName} size={iconSize} color={iconColor} />;
          }
        },
        tabBarLabel: ({ focused }) => (
          <Text style={{ color: focused ? '#ff9a76' : '#A0A0A0', fontSize: 12 }}>
            {route.name}
          </Text>
        ),
        tabBarShowLabel: true,
        tabBarStyle: {
          height: 85,
          backgroundColor: '#e5f4e3',
          paddingBottom: 10,
          paddingTop: 10,
          borderRadius: 25,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 3 },
          shadowRadius: 5,
          elevation: 5,
          position: 'absolute',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="Message" component={MessagePage} />
      <Tab.Screen name="Post" component={PostPage} />
      <Tab.Screen name="Notification" component={NotificationPage} />
      <Tab.Screen name="Profile" component={ProfilePage} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;

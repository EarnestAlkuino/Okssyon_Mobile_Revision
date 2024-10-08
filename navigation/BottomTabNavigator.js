import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import HomePage from '../screens/HomePage'; 
import MessagePage from '../screens/MessagePage'; 
import PostPage from '../screens/PostPage';
import NotificationPage from '../screens/NotificationPage';
import ProfilePage from '../screens/ProfilePage';
import AuctionStackNavigator from './AuctionStackNavigator';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let iconName;
          let iconStyle = { fontSize: 28, color: focused ? '#335441' : '#A0A0A0' };

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
          }

          return <Icon name={iconName} style={iconStyle} />;
        },
        tabBarShowLabel: false, // Hide text labels
        tabBarStyle: {
          height: 70,
          backgroundColor: '#e5f4e3',
          paddingBottom: 10,
          paddingTop: 12,
          borderRadius: 25,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: 3 },
          shadowRadius: 5,
          elevation: 5,
          position: 'absolute',
          marginHorizontal: -5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="Message" component={MessagePage} />
      <Tab.Screen name="Post" component={PostPage} />
      <Tab.Screen name="Notification" component={NotificationPage} />
      <Tab.Screen name="Profile" component={ProfilePage} />
      <Tab.Screen 
        name="AuctionStack" 
        component={AuctionStackNavigator} 
        options={{ tabBarButton: () => null }}  
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;

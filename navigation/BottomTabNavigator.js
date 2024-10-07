import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons'; // Import icons from the vector-icons library
import HomePage from '../screens/HomePage'; 
import MessagePage from '../screens/MessagePage'; 
import PostPage from '../screens/PostPage';
import NotificationPage from '../screens/NotificationPage';
import ProfilePage from '../screens/ProfilePage';
import AuctionStackNavigator from './AuctionStackNavigator';  // Import the stack navigator for categories

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let iconName;
          let iconStyle = { fontSize: 28, color: focused ? '#335441' : '#A0A0A0' }; // Adjust colors for other icons

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Message') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'Post') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
            // Special styling for the middle Post button to make it stand out with 335441 color
            iconStyle = {
              fontSize: 45,  // Adjust icon size to make it balanced
              color: '#fff',  // White icon color
              backgroundColor: '#335441', // Use the required green color
              borderRadius: 35,  // Circular button shape
              padding: 10,
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowOffset: { width: 0, height: 5 },
              shadowRadius: 8,
              elevation: 8,
              position: 'absolute',
              bottom: 20,  // Slightly elevated above other icons
            };
          } else if (route.name === 'Notification') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName} style={iconStyle} />;
        },
        tabBarShowLabel: false, // Hide labels for cleaner look
        tabBarStyle: {
          height: 70,
          backgroundColor: '#e5f4e3',
          paddingBottom: 10,
          paddingTop: 12,
          borderRadius: 25,  // Rounded bottom navigation bar
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowOffset: { width: 0, height: 5 },
          shadowRadius: 10,
          elevation: 12,
          position: 'absolute',
          marginHorizontal: -5,  // Side margins to give floating effect
        },
        headerShown: false, // Remove header for all screens
      })}
    >
      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="Message" component={MessagePage} />
      <Tab.Screen name="Post" component={PostPage} />
      <Tab.Screen name="Notification" component={NotificationPage} />
      <Tab.Screen name="Profile" component={ProfilePage} />
      
      {/* Hidden Auction Stack to keep bottom tabs visible without highlighting */}
      <Tab.Screen 
        name="AuctionStack" 
        component={AuctionStackNavigator} 
        options={{ tabBarButton: () => null }}  // Hide tab button for this stack
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;

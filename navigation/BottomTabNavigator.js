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

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Message') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'Post') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          
            iconStyle = {
              fontSize: 45,  
              color: '#fff',  
              backgroundColor: '#335441', 
              borderRadius: 35,  
              padding: 10,
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowOffset: { width: 0, height: 5 },
              shadowRadius: 8,
              elevation: 8,
              position: 'absolute',
              bottom: 20,  
            };
          } else if (route.name === 'Notification') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName} style={iconStyle} />;
        },
        tabBarShowLabel: false, 
        tabBarStyle: {
          height: 70,
          backgroundColor: '#e5f4e3',
          paddingBottom: 10,
          paddingTop: 12,
          borderRadius: 25,  
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowOffset: { width: 0, height: 5 },
          shadowRadius: 10,
          elevation: 12,
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

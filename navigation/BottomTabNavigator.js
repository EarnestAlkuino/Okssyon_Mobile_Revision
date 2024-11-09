import React from 'react';
import { Text, StyleSheet, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import HomePage from '../screens/HomePage';
import MessagePage from '../screens/MessagePage';
import PostPage from '../screens/PostPage';
import NotificationPage from '../screens/NotificationPage';
import ProfilePage from '../screens/ProfilePage';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let iconName;
          const iconSize = 28;
          const iconColor = focused ? '#405e40' : '#405e40'; // Dark green for unfocused state

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

          if (focused && route.name === 'Post') {
            return (
              <LinearGradient
                colors={['#405e40', '#4caf50']}
                style={styles.gradientIconContainer}
              >
                <Icon name={iconName} size={iconSize + 10} color="#fff" />
              </LinearGradient>
            );
          } else {
            return <Icon name={iconName} size={iconSize} color={iconColor} />;
          }
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
      <Tab.Screen name="Message" component={MessagePage} />
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
  gradientIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4caf50',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
    position: 'absolute',
    top: -30,
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
});

export default BottomTabNavigator;

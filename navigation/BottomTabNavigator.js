import React from 'react';
import { Text, StyleSheet, Dimensions, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import HomePage from '../screens/HomePage';
import PostPage from '../screens/PostPage';
import MyAuctionsPage from '../screens/MyAuctionsPage'; // Corrected Auctions page
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
          const iconColor = focused ? '#405e40' : '#405e40';

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Post':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'Auctions':
              iconName = focused ? 'pricetag' : 'pricetag-outline';
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
      {/* Ensure all screens have a valid component */}
      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="Post" component={PostPage} />
      <Tab.Screen name="Auctions" component={MyAuctionsPage} />
      <Tab.Screen name="Profile" component={ProfilePage} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarStyle: {
    height: 80,
    backgroundColor: '#fff',
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
});

export default BottomTabNavigator;

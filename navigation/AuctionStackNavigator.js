import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from '../screens/HomePage';  // The main tab
import AuctionPage from '../screens/AuctionPage';  // The category page

const Stack = createStackNavigator();

const AuctionStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomePage" component={HomePage} options={{ headerShown: false }} />
      <Stack.Screen name="AuctionPage" component={AuctionPage} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default AuctionStackNavigator;

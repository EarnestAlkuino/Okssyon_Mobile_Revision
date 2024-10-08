import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LandingPage from '../screens/LandingPage';
import LandingPage2 from '../screens/LandingPage2';
import LandingPage3 from '../screens/LandingPage3';
import LoginPage from '../screens/LoginPage';
import SignUpPage from '../screens/SignUpPage';
import VerifyPage from '../screens/VerifyPage';
import BottomTabNavigator from '../navigation/BottomTabNavigator';
import AuctionPage from '../screens/AuctionPage';
import ForgotPasswordPage from '../screens/ForgotPasswordPage';



const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="LandingPage"
          component={LandingPage}
          options={{ headerShown: false }}  // Hides the header
        />
        <Stack.Screen
          name="LandingPage2"
          component={LandingPage2}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LandingPage3"
          component={LandingPage3}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LoginPage"
          component={LoginPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUpPage"
          component={SignUpPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VerifyPage"
          component={VerifyPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AuctionPage"   // Adding the AuctionPage screen here
          component={AuctionPage}
          options={{ headerShown: false }}   // You can choose to show/hide the header
        />
        <Stack.Screen
          name="ForgotPasswordPage"   // Adding the AuctionPage screen here
          component={ForgotPasswordPage}
          options={{ headerShown: false }}   // You can choose to show/hide the header
        />
        <Stack.Screen
          name="MainTabs"
          component={BottomTabNavigator}  // Bottom tab navigator after login or signup
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

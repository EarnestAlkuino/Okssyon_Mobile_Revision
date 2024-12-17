import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LandingPage from '../screens/LandingPage';
import LandingPage2 from '../screens/LandingPage2';
import LandingPage3 from '../screens/LandingPage3';
import LoginPage from '../screens/LoginPage';
import SignUpPage from '../screens/SignUpPage';
import HomePage from '../screens/HomePage';
import VerifyPage from '../screens/VerifyPage';
import BottomTabNavigator from '../navigation/BottomTabNavigator';
import AuctionPage from '../screens/AuctionPage';
import ForgotPasswordPage from '../screens/ForgotPasswordPage';
import ConfirmForgotPass from '../screens/ConfirmForgotPass';
import SettingsPage from '../screens/SettingsPage';
import AccountPage from '../screens/AccountPage';
import HelpPage from '../screens/HelpPage';
import LanguagePage from '../screens/LanguagePage';
import PnsPage from '../navigation/PnsPage';  
import Newmessage from '../screens/Newmessage';
import UploadedPage from '../screens/UploadedPage';
import LivestockAuctionDetailPage from '../screens/LivestockAuctionDetailPage';
import ChatPage from '../screens/ChatPage';
import BidPage from '../screens/BidPage';
import EditAuctionPage from '../screens/EditAuctionPage';
import ForumPage from '../screens/ForumPage';
import WinnerConfirmationPage from '../screens/WinnerConfirmationPage';
import PaymentWebView from '../screens/PaymentWebView';
import BidderTransactionPage from '../screens/BidderTransactionPage';
import SellerTransactionPage from '../screens/SellerTransactionPage';
import OtpPage from '../screens/OtpPage';
import MyAuctionsPage from '../screens/MyAuctionsPage';
import NotificationPage from '../screens/NotificationPage';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="LandingPage"
          component={LandingPage}
          options={{ headerShown: false }}
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
          name="HomePage"
          component={HomePage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VerifyPage"
          component={VerifyPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AuctionPage"
          component={AuctionPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ForgotPasswordPage"
          component={ForgotPasswordPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ConfirmForgotPass"
          component={ConfirmForgotPass}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SettingsPage"
          component={SettingsPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AccountPage"
          component={AccountPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HelpPage"
          component={HelpPage}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="LanguagePage"
          component={LanguagePage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PnsPage"
          component={PnsPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
        name="UploadedPage"
        component={UploadedPage}
        options={{headerShown: false}}
        />
        <Stack.Screen
        name="Newmessage"
        component={Newmessage}
        options={{headerShown: false}}
        />
         <Stack.Screen
        name="LivestockAuctionDetailPage"
        component={LivestockAuctionDetailPage}
        options={{headerShown: false}}
        />
        <Stack.Screen
        name="ChatPage"
        component={ChatPage}
        options={{headerShown: false}}
        />
         <Stack.Screen
        name="BidPage"
        component={BidPage}
        options={{headerShown: false}}
        />
          <Stack.Screen
        name="EditAuctionPage"
        component={EditAuctionPage}
        options={{headerShown: false}}
        />
        <Stack.Screen
        name='ForumPage'
        component={ForumPage}
        options={{headerShown: false}}
        />
        <Stack.Screen
        name='WinnerConfirmationPage'
        component={WinnerConfirmationPage}
        options={{headerShown: false}}
        />
         <Stack.Screen
        name='PaymentWebView'
        component={PaymentWebView}
        options={{headerShown: false}}
        />
           <Stack.Screen
        name='BidderTransactionPage'
        component={BidderTransactionPage}
        options={{headerShown: false}}
        />
         <Stack.Screen
        name='OtpPage'
        component={OtpPage}
        options={{headerShown: false}}
        />
        <Stack.Screen
        name='SellerTransactionPage'
        component={SellerTransactionPage}
        options={{headerShown: false}}
        />
         <Stack.Screen
        name='NotificationPage'
        component={NotificationPage}
        options={{headerShown: false}}
        />
        <Stack.Screen
          name="MainTabs"
          component={BottomTabNavigator}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

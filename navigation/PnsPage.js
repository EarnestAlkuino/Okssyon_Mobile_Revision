import React from 'react';
import { View, StyleSheet } from 'react-native'; 
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Pns1 from '../screens/Pns1';  
import Pns2 from '../screens/Pns2';  
import Pns3 from '../screens/Pns3';  
import Header from '../Components/Header'; 
import { useNavigation } from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();

const PnsPage = () => {
  const navigation = useNavigation(); // Using the navigation hook for back button action

  return (
    <View style={styles.container}>
      <Header
        title="Weekly Average Prices"
        showSettingsButton={false}  // Make sure this prop is handled in the Header component
        onBackPress={() => navigation.goBack()} // Handles back press navigation
        leftIcon="arrow-back"  // Customize back icon
        rightIcon="settings"  // Customize settings icon if needed
        leftIconColor="white"  // Icon color customizations
        rightIconColor="white"
      />
      <Tab.Navigator
        screenOptions={{
          tabBarLabelStyle: { 
            fontSize: 12, 
            color: '#257446', 
            fontWeight: 'bold' 
          },
          tabBarStyle: { 
            height: 56, // Adjust tab bar height
            backgroundColor: '#f0f0f0', // Set background color
          },
          tabBarActiveTintColor: 'black',
          tabBarIndicatorStyle: { 
            backgroundColor: '#DFAE47', 
            fontWeight: 'bold' 
          },
        }}
      >
        {/* No need to pass key here, React Navigation handles it internally */}
        <Tab.Screen name="PNS 1" component={Pns1} />
        <Tab.Screen name="PNS 2" component={Pns2} />
        <Tab.Screen name="PNS 3" component={Pns3} />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,  // Ensure the container takes the full height
  },
});

export default PnsPage;

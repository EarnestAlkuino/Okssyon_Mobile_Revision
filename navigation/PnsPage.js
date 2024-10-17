import React from 'react';
import { View, StyleSheet } from 'react-native'; // Import View and StyleSheet
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Pns1 from '../screens/Pns1';  
import Pns2 from '../screens/Pns2';  
import Pns3 from '../screens/Pns3';  
import Header from '../Components/Header'; 
import { useNavigation } from '@react-navigation/native'; // Hook for navigation

const Tab = createMaterialTopTabNavigator();

const PnsPage = () => {
  const navigation = useNavigation(); // Access navigation via the hook
  
  return (
    <View style={styles.container}>
      <Header
        title="Weekly Average Prices"
        showSettingsButton={false}
        onBackPress={() => navigation.goBack()} // Handle back navigation
        leftIcon="arrow-back" // Customize the left icon
        rightIcon="settings" // Customize the right icon if needed
        leftIconColor="white" // Customize the left icon color
        rightIconColor="white" // Customize the right icon color
      />
      <Tab.Navigator
        screenOptions={{
          tabBarLabelStyle: { fontSize: 12, color: '#257446', fontWeight: 'bold' },
          tabBarStyle: { 
            height: 56, // Adjust the height if needed
            backgroundColor: '#f0f0f0', // Set your desired background color here
          },
          tabBarActiveTintColor: 'black',
          tabBarIndicatorStyle: { backgroundColor: '#DFAE47', fontWeight: 'bold' },
        }}
      >
        <Tab.Screen name="PNS 1" component={Pns1} />
        <Tab.Screen name="PNS 2" component={Pns2} />
        <Tab.Screen name="PNS 3" component={Pns3} />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensure the container takes full height
  },
});

export default PnsPage;

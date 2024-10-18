import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '../Components/Header';

const MessagePage = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Ensure the status bar content is light */}
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      {/* Header Section with reusable Header component */}
      <Header 
        title="Message"
        showBackButton={true}
        showSettingsButton={false} // You can toggle this as needed
        onBackPress={() => navigation.goBack()} // Navigate to Recent page
        onNewMessagePress={() => {/* handle new message action here */}} // Define new message action
      />

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="gray" />
        <TextInput style={styles.searchInput} placeholder="Search" />
      </View>

      {/* Messages Container (can be filled later) */}
      <View style={styles.messageContainer}>
        <Text>No messages yet.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    margin: 10,
    borderRadius: 10,
  },
  searchInput: {
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MessagePage;

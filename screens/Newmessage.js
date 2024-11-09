import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import Header from '../Components/Header'; // Adjust the path based on your file structure
import { Ionicons } from '@expo/vector-icons';

const MessageInput = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <Header 
        title="Seller/Bidder Name" 
        showBackButton={true} 
        onBackPress={() => alert('Back Pressed')} 
        showSettingsButton={true} 
        onSettingsPress={() => alert('Settings Pressed')} 
      />

      {/* Logo and Title Section */}
      <View style={styles.header}>
        <Image source={require('../assets/logo1.png')} style={styles.logo} />
        <Text style={styles.title}>Seller/Bidder Name</Text>
      </View>

      {/* Message Input Box */}
      <View style={styles.messageBox}>
        <TextInput 
          style={styles.input} 
          placeholder="Type a message..." 
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={styles.sendButton} onPress={() => alert('Message Sent')}>
          <Ionicons name="send" size={24} color="#257446" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    alignItems: 'center',
    marginVertical: 10,
  },
  logo: {
    height: 50,
    width: 50,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 5,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#f8f8f8',
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: '#e8e8e8',
    fontSize: 16,
    marginRight: 10,
    color: '#333',
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
});

export default MessageInput;

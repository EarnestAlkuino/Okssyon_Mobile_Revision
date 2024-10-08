import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const MessagePage = () => {
  return (
    <View style={styles.container}>
      {/* Ensure the status bar content is light */}
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      {/* Header Section with Gradient */}
      <LinearGradient
        colors={['#257446', '#234D35']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Message</Text>
        <TouchableOpacity>
          <Ionicons name="person-circle" size={30} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Subheader */}
      <LinearGradient
        colors={['#257446', '#234D35']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.subheader}>
        <Text style={styles.subheaderTitle}>Inbox</Text>
        <TouchableOpacity style={styles.newMessageButton}>
          <Ionicons name="create-outline" size={24} color="white" />
          <Text style={styles.newMessageText}>New Message</Text>
        </TouchableOpacity>
      </LinearGradient>

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingTop: StatusBar.currentHeight || 30, // Ensures the gradient covers the status bar area
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'semi-bold',
  },
  subheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  subheaderTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  newMessageButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newMessageText: {
    color: 'white',
    marginLeft: 5,
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
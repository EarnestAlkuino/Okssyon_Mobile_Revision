import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HomeHeader = ({ name, onNotificationPress, unreadCount }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hello, {name}</Text>
      <TouchableOpacity style={styles.notificationButton} onPress={onNotificationPress}>
        <Ionicons name="notifications-outline" size={28} color="#405e40" />
        {unreadCount > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F4F4F4',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#405e40',
  },
  notificationButton: {
    position: 'relative',
    padding: 10,
  },
  badgeContainer: {
    position: 'absolute',
    top: -5,
    right: -7,
    backgroundColor: '#FF0000',
    borderRadius: 12,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default HomeHeader;

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const ProfileInfo = ({ profileImage, userName, email, onProfileImageChange }) => (
  <View style={styles.profileInfoContainer}>
    <TouchableOpacity onPress={onProfileImageChange}>
      <Image
        source={profileImage ? { uri: profileImage } : require('../../assets/default.png')}
        style={styles.profileImage}
      />
    </TouchableOpacity>
    <Text style={styles.name}>{userName || 'Loading...'}</Text>
    <Text style={styles.email}>{email || 'Loading...'}</Text>
  </View>
);

const styles = StyleSheet.create({
  profileInfoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#ddd',
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
});

export default ProfileInfo;

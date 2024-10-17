import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Header from '../Components/Header';

const ProfilePage = ({ navigation }) => {
  const [imageUri, setImageUri] = useState(null);
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('John Doe'); // Default username

  useEffect(() => {
    // Simulate fetching user data
    const fetchUserData = () => {
      setUserName('Jane Doe'); // Replace with dynamic data
      setEmail('janedoe@example.com'); // Replace with dynamic data
    };

    fetchUserData();
  }, []);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync();
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    } else {
      alert('Image selection was canceled or failed.');
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSettingsPress = () => {
    navigation.navigate('SettingsPage');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <Header
        title="Profile"
        onBackPress={handleBackPress}
        onSettingsPress={handleSettingsPress}
      />

      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.profilePicContainer}>
          <Image
            source={{ uri: imageUri || 'https://via.placeholder.com/150' }}
            style={styles.profilePic}
          />
        </TouchableOpacity>

        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.userEmail}>{email}</Text>

        <View style={styles.recentActivities}>
          <Text style={styles.activitiesTitle}>Recent Activities</Text>
          <Text style={styles.activitiesText}>No recent activities available.</Text>
        </View>
      </View>
    </View>
  );
};

// Styles definition without Poppins font
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
  },
  profilePicContainer: {
    borderRadius: 75,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#fff',
    marginBottom: 15,
  },
  profilePic: {
    width: 100,
    height: 100,
  },
  userName: {
    color: '#405e40',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 5,
  },
  userEmail: {
    color: '#405e40',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  recentActivities: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    width: '100%',
    alignItems: 'flex-start',
  },
  activitiesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  activitiesText: {
    color: 'gray',
    fontSize: 16,
    marginTop: 10,
  },
});

export default ProfilePage;

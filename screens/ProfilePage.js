import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Header from '../Components/Header';

const ProfilePage = () => {
  const [imageUri, setImageUri] = useState(null);
  const [email, setEmail] = useState('jwonyoung91@gmail.com');
  const [userId, setUserId] = useState('#234567');

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync();

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleBackPress = () => {
    alert('Back button pressed!');
  };

  const handleSettingsPress = () => {
    alert('Settings button pressed!');
  };

  return (
    <View style={styles.container}>
      {/* Reusing the customizable Header with specific style */}
      <Header
        title="Profile"
        onBackPress={handleBackPress}
        onSettingsPress={handleSettingsPress}
        containerStyle={styles.customHeader} // Custom style for ProfilePage header
      />

      {/* Profile and user information container */}
      <View style={styles.profileContainer}>
        {/* Profile Picture */}
        <TouchableOpacity onPress={pickImage} style={styles.profilePicContainer}>
          <Image
            source={{ uri: imageUri || 'https://via.placeholder.com/150' }}
            style={styles.profilePic}
          />
        </TouchableOpacity>
      
        {/* User Info below the profile picture */}
        <Text style={styles.userName}>John Doe</Text>
        <TextInput
          style={styles.userEmail}
          value={email}
          onChangeText={setEmail}
          editable={false}
        />
        <Text style={styles.userId}>{userId}</Text>

        {/* Link to weekly average price */}
        <TouchableOpacity>
          <Text style={styles.link}>View new weekly average price</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activities Section */}
      <View style={styles.recentActivities}>
        <Text style={styles.activitiesTitle}>Recent Activities</Text>
        <Text style={styles.activitiesText}>No recent activities available.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  customHeader: {
    paddingVertical: 100,
    top: 20, // Adjusted height for ProfilePage header
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: -75, // To position the profile picture closer to the header
  },
  profilePicContainer: {
    borderRadius: 75,
    overflow: 'hidden',
    borderWidth: 5,
    borderColor: '#fff', // To create a border around the image
  },
  profilePic: {
    width: 100,
    height: 100,
  },
  userName: {
    color: 'black',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 2,
  },
  userEmail: {
    color: 'black',
    fontSize: 16,
    marginBottom: 2,
  },
  userId: {
    color: 'black',
    fontSize: 16,
    marginBottom: 15,
  },
  link: {
    color: 'green',
    fontSize: 14,
    marginVertical: 20,
    textDecorationLine: 'underline',
   left: 40,// Aligning the link to the left
    paddingHorizontal: 20,
    bottom: 20,
  },
  recentActivities: {
    marginTop: 10, // Less margin to push container closer to the link
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    width: '90%',
    alignSelf: 'center',
    alignItems: 'flex-start', // Align content to the left
  },
  activitiesTitle: {
    color: 'black',
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

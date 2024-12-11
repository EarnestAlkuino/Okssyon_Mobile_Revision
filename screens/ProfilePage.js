import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications'; // Added for notifications
import { supabase } from '../supabase';
import { Upload } from 'tus-js-client'; // Importing the Upload class
import Header from '../Components/Header'; // Ensure this path is correct

const ProfilePage = ({ navigation }) => {
  const [email, setEmail] = useState(null);
  const [userName, setUserName] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([
    { id: '1', title: 'Updated Profile Picture', time: '2024-11-23 10:30 AM' },
    { id: '2', title: 'Commented on Project: Mobile App', time: '2024-11-22 03:15 PM' },
    { id: '3', title: 'Completed Task: Design Review', time: '2024-11-21 09:00 AM' },
  ]); // Temporary hardcoded activities

  // Fetch user data from Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          Alert.alert('Error', error?.message || 'User not authenticated.');
          return;
        }

        setUserId(user.id);

        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, email, profile_image')
          .eq('id', user.id)
          .single();

        if (profileError) {
          Alert.alert('Error', profileError.message);
        } else {
          setUserName(data.full_name);
          setEmail(data.email);
          setProfileImage(data.profile_image);
        }
      } catch (error) {
        Alert.alert('Error', 'Something went wrong. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleProfileImageChange = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Gallery access is needed to change your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      try {
        const selectedImageUri = result.assets[0].uri;

        // Fetch the image and convert it to a Blob
        const response = await fetch(selectedImageUri);
        const blob = await response.blob();
        const fileName = `${email}-${Date.now()}.jpg`;

        // Upload the image using tus-js-client
        await uploadFileToSupabase(blob, fileName);
      } catch (error) {
        console.error('Error during profile image change:', error);
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleSettingsPress = () => {
    navigation.navigate('SettingsPage'); // Navigate to Settings
  };

  const uploadFileToSupabase = async (file, fileName) => {
    const { data: { session } } = await supabase.auth.getSession();
    const projectId = 'ikvsahtemgarvhkvaftl';
    const bucketName = 'profile-images';

    return new Promise((resolve, reject) => {
      const upload = new Upload(file, {
        endpoint: `https://${projectId}.supabase.co/storage/v1/upload/resumable`,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          authorization: `Bearer ${session?.access_token}`,
          'x-upsert': 'true',
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        metadata: {
          bucketName,
          objectName: fileName,
          contentType: 'image/jpeg',
        },
        chunkSize: 6 * 1024 * 1024,
        onError: function (error) {
          console.error('Failed because:', error);
          reject(error);
        },
        onProgress: function (bytesUploaded, bytesTotal) {
          const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
          console.log(`${percentage}% uploaded`);
        },
        onSuccess: async function () {
          const publicUrl = `https://${projectId}.supabase.co/storage/v1/object/public/${bucketName}/${fileName}`;

          const { error: updateError } = await supabase
            .from('profiles')
            .update({ profile_image: publicUrl })
            .eq('id', userId);

          if (updateError) {
            console.error('Error updating profile image URL:', updateError);
            Alert.alert('Error', 'Failed to update profile image URL.');
          } else {
            setProfileImage(publicUrl);
            Alert.alert('Success', 'Profile picture updated!');

            // Trigger a local notification to inform the user
            await Notifications.scheduleNotificationAsync({
              content: {
                title: 'Profile Picture Updated!',
                body: 'Your profile picture has been successfully updated.',
              },
              trigger: null, // Trigger immediately
            });

            resolve();
          }
        },
      });

      upload.findPreviousUploads().then((previousUploads) => {
        if (previousUploads.length) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }

        upload.start();
      });
    });
  };

  const renderActivityItem = ({ item }) => (
    <View style={styles.activityItem}>
      <Text style={styles.activityTitle}>{item.title}</Text>
      <Text style={styles.activityTime}>{item.time}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Profile"
        showBackButton={false}
        onSettingsPress={handleSettingsPress}
        showSettingsButton={true}
      />
      <View style={styles.content}>
        <TouchableOpacity onPress={handleProfileImageChange}>
          <Image
            source={profileImage ? { uri: profileImage } : require('../assets/default.png')}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <Text style={styles.name}>{userName || 'Loading...'}</Text>
        <Text style={styles.email}>{email || 'Loading...'}</Text>

        {/* Recent Activities Section */}
        <View style={styles.recentActivities}>
          <Text style={styles.activitiesTitle}>Recent Activities</Text>
          <FlatList
            data={recentActivities}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 10 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
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
  recentActivities: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
    elevation: 2,
    width: '100%',
  },
  activitiesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  activityItem: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 10,
  },
  activityTitle: {
    fontSize: 16,
    color: '#333',
  },
  activityTime: {
    fontSize: 14,
    color: '#666',
  },
});

export default ProfilePage;
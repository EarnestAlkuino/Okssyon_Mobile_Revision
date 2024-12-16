import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, SafeAreaView, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { supabase } from '../supabase';
import ProfileHeader from '../Components/Profile/ProfileHeader';
import ProfileInfo from '../Components/Profile/ProfileInfo';
import RecentActivities from '../Components/Profile/RecentActivities';

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
  ]);

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
      Alert.alert('Success', 'Image picked successfully.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#405e40" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ProfileHeader title="Profile" onSettingsPress={() => navigation.navigate('SettingsPage')} />
      <View style={styles.content}>
        <ProfileInfo
          profileImage={profileImage}
          userName={userName}
          email={email}
          onProfileImageChange={handleProfileImageChange}
        />
        <RecentActivities recentActivities={recentActivities} />
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
  content: {
    flex: 1,
    padding: 20,
  },
});

export default ProfilePage;

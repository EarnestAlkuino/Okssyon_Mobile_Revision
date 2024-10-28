import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Alert } from 'react-native';
import { supabase } from '../supabase'; // Ensure this path is correct
import Header from '../Components/Header'; // Ensure this path is correct

const ProfilePage = ({ navigation }) => {
  const [email, setEmail] = useState(null); // Initialize as null to show 'Loading...'
  const [userName, setUserName] = useState(null); // Initialize as null to show 'Loading...'

  // Fetch the logged-in user's profile data
  useEffect(() => {
    const fetchUserData = async () => {
      // Use the updated method to get the authenticated user
      const { data: { user }, error } = await supabase.auth.getUser(); 

      if (error || !user) {
        Alert.alert('Error fetching user', error?.message || 'No user found. Please log in.');
        return;
      }

      const { data, error: profileError } = await supabase
        .from('profiles') // Fetch data from the 'profiles' table
        .select('full_name, email') // Select only the full_name and email fields
        .eq('id', user.id) // Match by user id
        .single(); // Get a single record

      if (profileError) {
        Alert.alert('Error fetching profile data', profileError.message);
      } else {
        // Update state with fetched profile data
        setUserName(data.full_name);
        setEmail(data.email);
      }
    };

    fetchUserData(); // Fetch profile data when the component mounts
  }, []);

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
        showSettingsButton={true}
      />

      <View style={styles.profileContainer}>
        {/* Display the user's name and email conditionally */}
        <Text style={styles.userName}>
          {userName || 'Loading...'} {/* Show Loading only if userName is null */}
        </Text>
        <Text style={styles.userEmail}>
          {email || 'Loading...'} {/* Show Loading only if email is null */}
        </Text>

        {/* Recent activities section (you can remove this if not needed) */}
        <View style={styles.recentActivities}>
          <Text style={styles.activitiesTitle}>Recent Activities</Text>
          <Text style={styles.activitiesText}>No recent activities available.</Text>
        </View>
      </View>
    </View>
  );
};

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

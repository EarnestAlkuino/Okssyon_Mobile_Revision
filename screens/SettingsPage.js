// SettingsPage.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SettingsPage = ({ navigation }) => {
  const handleLogout = () => {
    alert('Logout Pressed');
    // Add your logout functionality here
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>SETTINGS</Text>
        <Image source={require('../assets/logo1.png')} style={styles.logo} />
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionTitle}>GENERAL</Text>
        {['Account', 'Help', 'Language', 'About Us'].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.listItem}
            onPress={() => {
              if (item === 'Account') {
                navigation.navigate('AccountPage');
              } else if (item === 'Help') {
                navigation.navigate('HelpPage');  
              } else if (item === 'Language') {
                navigation.navigate('LanguagePage');  // Navigate to HelpPage
              } else {
                // Placeholder for other navigations
                alert(`${item} Page`);
              }
            }}
          >
            <Text style={styles.listItemText}>{item}</Text>
            <Ionicons name="chevron-forward" size={20} color="gray" />
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>FEEDBACK</Text>
        {['Report A Bug', 'Send Feedback'].map((item, index) => (
          <TouchableOpacity key={index} style={styles.listItem}>
            <Text style={styles.listItemText}>{item}</Text>
            <Ionicons name="chevron-forward" size={20} color="gray" />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f0f0f0',
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
  },
  logo: {
    width: 100,
    height: 40,
    resizeMode: 'contain',
  },
  scrollView: {
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemText: {
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#405e40',
    borderRadius: 5,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SettingsPage;

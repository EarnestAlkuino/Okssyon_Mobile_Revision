// SettingsPage.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Header from '../Components/Header'; 

const SettingsPage = ({ navigation }) => {
  const handleLogout = () => {
    navigation.navigate('LoginPage'); 
  };

  return (
    <View style={styles.container}>
      {/* Header Component */}
      <Header
        title="SETTINGS"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        showSettingsButton={false} 
      />

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
                navigation.navigate('LanguagePage');
              } else {
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

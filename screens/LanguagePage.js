import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const LanguagePage = ({ navigation, route }) => {
  // Default language is set to English ('en')
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  useEffect(() => {
    // Retrieve and apply the saved language setting if available
    const loadLanguagePreference = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('appLanguage');
        if (savedLanguage) {
          setSelectedLanguage(savedLanguage);
        }
      } catch (error) {
        console.error('Failed to load language preference', error);
      }
    };
    loadLanguagePreference();
  }, []);

  const handleLanguageChange = async (language) => {
    setSelectedLanguage(language);
    // Save language preference to AsyncStorage
    try {
      await AsyncStorage.setItem('appLanguage', language);
    } catch (error) {
      console.error('Failed to save language preference', error);
    }
    // Add further logic to apply the language throughout the app, if necessary
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>Select Language</Text>

      <TouchableOpacity
        style={[styles.languageOption, selectedLanguage === 'en' && styles.selectedOption]}
        onPress={() => handleLanguageChange('en')}
      >
        <Text style={styles.languageText}>English</Text>
        {selectedLanguage === 'en' && <Ionicons name="checkmark" size={20} color="#405e40" />}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.languageOption, selectedLanguage === 'tl' && styles.selectedOption]}
        onPress={() => handleLanguageChange('tl')}
      >
        <Text style={styles.languageText}>Tagalog</Text>
        {selectedLanguage === 'tl' && <Ionicons name="checkmark" size={20} color="#405e40" />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#405e40',
    marginBottom: 40,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  selectedOption: {
    borderColor: '#405e40',
    borderWidth: 2,
  },
  languageText: {
    fontSize: 18,
    color: '#405e40',
  },
});

export default LanguagePage;

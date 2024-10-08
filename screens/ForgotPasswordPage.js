import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';  // Importing the Icon library

const ForgotPasswordPage = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="chevron-back" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Lock Icon */}
      <Image 
        source={require('../assets/forgot.png')} 
        style={styles.lockIcon} 
      />

      {/* Title */}
      <Text style={styles.title}>Forgot Password</Text>

      {/* Email Input */}
      <TextInput 
        placeholder="EMAIL" 
        placeholderTextColor="#A0A0A0" 
        style={styles.input} 
      />

      {/* OR Separator */}
      <View style={styles.orSeparator}>
        <View style={styles.line} />
        <Text style={styles.orText}>OR</Text>
        <View style={styles.line} />
      </View>

      {/* Social Media Login Buttons */}
      <View style={styles.socialButtons}>
        <TouchableOpacity>
          <Image source={require('../assets/fb.png')} style={styles.socialIcon} />
        </TouchableOpacity>

        <TouchableOpacity>
          <Image source={require('../assets/ios.png')} style={styles.socialIcon} />
        </TouchableOpacity>

        <TouchableOpacity>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/281/281764.png' }} 
            style={styles.socialIcon} 
          />
        </TouchableOpacity>
      </View>

      {/* Next Button */}
      <TouchableOpacity 
        style={styles.nextButton} 
        onPress={() => navigation.navigate('ConfirmForgotPass')}  // Navigate to ConfirmForgotPass
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPasswordPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,  
    backgroundColor: '#335441',  
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  lockIcon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#335441',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f7f7f7',
  },
  orSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  orText: {
    marginHorizontal: 10,
    color: '#A0A0A0',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
    marginBottom: 30,
  },
  socialIcon: {
    width: 40,
    height: 40,
  },
  nextButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#335441',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Button from '../Components/Button'; 

const LandingPage3 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      {/* Login Button */}
      <Button
        title="Login"
        onPress={() => navigation.navigate('LoginPage')} 
        style={styles.loginButton} 
        textStyle={styles.loginButtonText} 
      />

      {/* Signup Button */}
      <Button
        title="Sign Up"
        onPress={() => navigation.navigate('SignUpPage')} 
        style={styles.signupButton} 
        textStyle={styles.signupButtonText} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    marginBottom: 40,
  },
  loginButton: {
    width: '80%',
    backgroundColor: '#405e40', 
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff', 
    fontWeight: 'bold',
  },
  signupButton: {
    width: '80%',
    backgroundColor: 'transparent', 
    paddingVertical: 10,
    borderRadius: 10,
    borderColor: '#405e40', 
    borderWidth: 2,
    marginBottom: 20,
  },
  signupButtonText: {
    color: '#405e40', 
    fontWeight: 'bold',
  },
});

export default LandingPage3;

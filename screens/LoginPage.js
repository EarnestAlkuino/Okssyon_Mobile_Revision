import React, { useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, Alert } from 'react-native';
import Button from '../Components/Button'; 
import supabase from '../supabaseClient'; // Import the Supabase client

const SignupPage = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Function to handle saving user data and navigating to HomePage
  const handleSignup = async () => {
    try {
      // Insert email and password into the user_account table
      const { data, error } = await supabase
        .from('user_account')
        .insert([
          { 
            email: email.toLowerCase(), // Always store emails in lowercase
            password: password,          // Store password (hash it before saving in production)
          }
        ]);

      if (error) {
        Alert.alert('Error', error.message); // Handle error if insertion fails
      } else {
        Alert.alert('Success', 'Account created successfully');
        // Navigate to HomePage.js after success
        navigation.navigate('MainTabs');  // Navigate to HomePage on successful signup
      }
    } catch (err) {
      console.error('Signup error:', err);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require('../assets/logo1.png')} style={styles.logo} />

      {/* Welcome Text */}
      <Text style={styles.welcomeText}>Welcome!</Text>
      <Text style={styles.subText}>Sign up to get started</Text>

      {/* Input fields */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="EMAIL"
          placeholderTextColor="#808080"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="PASSWORD"
          placeholderTextColor="#808080"
          secureTextEntry
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
      </View>

      {/* Signup Button */}
      <Button
        title="Sign Up"
        style={styles.signupButton}
        textStyle={styles.signupButtonText}
        onPress={handleSignup}  // Call the handleSignup function
      />

      <Text style={styles.orText}>OR</Text>

      {/* Social Login */}
      <View style={styles.socialLoginContainer}>
        <Image source={require('../assets/fb.png')} style={styles.socialIcon} />
        <Image source={require('../assets/ios.png')} style={styles.socialIcon} />
        <Image source={require('../assets/gg.png')} style={styles.socialIcon} />
      </View>

      {/* Already have an account */}
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpPrompt}>Already have an account?</Text>
        <Button
          title="Log In"
          onPress={() => navigation.navigate('LoginPage')}
          style={{ backgroundColor: 'transparent' }}
          textStyle={styles.signUpText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 140,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#335441', 
    marginBottom: 5,
  },
  subText: {
    fontSize: 16,
    color: '#808080', 
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 10,
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#335441', 
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  signupButton: {
    width: '100%',
    backgroundColor: '#335441', 
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  orText: {
    fontSize: 16,
    color: '#808080',
    marginVertical: 20,
  },
  socialLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginBottom: 20,
  },
  socialIcon: {
    width: 42,
    height: 42,
    resizeMode: 'contain',
  },
  signUpContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  signUpPrompt: {
    color: '#808080',
  },
  signUpText: {
    color: '#335441',
    fontWeight: 'bold',
  },
});

export default SignupPage;

import React, { useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, Alert } from 'react-native';
import Button from '../Components/Button'; // Reusable button component
import { supabase } from '../supabase'; // Assuming you have configured Supabase

const SignUpPage = ({ navigation }) => {
  const [fullName, setFullName] = useState(''); // Full name input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Sign up function
  async function signUpWithEmail() {
    // Check if passwords match
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match");
      return;
    }

    // Basic validation
    if (!fullName || !email || !password) {
      Alert.alert('Please fill in all fields.');
      return;
    }

    setLoading(true);

    // Step 1: Sign up the user with email and password
    const { error, data } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Error signing up:', error.message);
      setLoading(false);
      return;
    }

    const user = data.user; // Get the user object

    // Step 2: Insert full name and email into 'profiles' table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ id: user.id, full_name: fullName, email: email }]);

    if (profileError) {
      Alert.alert('Error inserting profile:', profileError.message);
    } else {
      Alert.alert('Please check your inbox for email verification!');
      navigation.navigate('LoginPage'); // Navigate to LoginPage after signup
    }

    setLoading(false);
  }

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require('../assets/logo1.png')} style={styles.logo} />

      {/* Welcome Text */}
      <View style={styles.textContainer}>
        <Text style={styles.welcomeText}>Create Account!</Text>
        <Text style={styles.subText}>Sign up to get started</Text>
      </View>

      {/* Input fields */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="FULL NAME"
          placeholderTextColor="#808080"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder="EMAIL"
          placeholderTextColor="#808080"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="PASSWORD"
          placeholderTextColor="#808080"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="CONFIRM PASSWORD"
          placeholderTextColor="#808080"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoCapitalize="none"
        />
      </View>

      {/* Sign Up Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Sign Up"
          style={styles.signUpButton}
          textStyle={styles.signUpButtonText}
          onPress={signUpWithEmail}
          disabled={loading}
        />
      </View>

      {/* Already have an account? */}
      <View style={styles.loginContainer}>
        <Text style={styles.loginPrompt}>Already have an account?</Text>
        <Button
          title="Log In"
          onPress={() => navigation.navigate('LoginPage')} // Navigate to LoginPage
          style={styles.loginButton}
          textStyle={styles.loginText}
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
    alignItems: 'flex-start', // Align items to the start (left)
    backgroundColor: '#fff',
  },
  logo: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 140,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  textContainer: {
    alignItems: 'flex-start', // Align text to the left
    width: '100%', // Make sure it takes full width
    marginBottom: 30, // Space between the texts and input fields
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#335441', // Dark green text
    marginBottom: 5,
  },
  subText: {
    fontSize: 16,
    color: '#808080', // Light grey text
  },
  inputContainer: {
    width: '100%',
    marginBottom: 10,
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#335441', // Dark green border color
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  buttonContainer: {
    width: '100%', // Full width for the button container
    alignItems: 'flex-start', // Align button to the left
  },
  signUpButton: {
    backgroundColor: '#335441', // Dark green background
    paddingVertical: 10,
    borderRadius: 10,
    width: '100%', // Full width for the button
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center', // Center text inside the button
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center', 
  },
  loginPrompt: {
    color: '#808080',
  },
  loginButton: {
    backgroundColor: 'transparent',
  },
  loginText: {
    color: '#335441',
    fontWeight: 'bold',
  },
});

export default SignUpPage;

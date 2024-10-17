import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import Button from '../Components/Button';
import supabase from '../supabaseClient'; // Import the Supabase client

const SignupPage = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Function to handle the sign-up process
  const handleSignup = async () => {
    // Check if password and confirm password match
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      // Insert the user details (full name, email, and password) into the user_profiles table
      const { error } = await supabase
        .from('user_profiles')
        .insert([{ full_name: fullName, email, password }]); // Store the plain password (you should hash it if necessary)

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'Account created successfully!');
        navigation.navigate('VerifyPage'); // Navigate to the verification page
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#808080"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#808080"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#808080"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#808080"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Button
        title="Sign Up"
        style={styles.signupButton}
        textStyle={styles.signupButtonText}
        onPress={handleSignup} // Call the signup handler
      />

      <View style={styles.loginRedirect}>
        <Text style={styles.loginPrompt}>Already have an account?</Text>
        <Button
          title="Log In"
          style={styles.loginButton}
          textStyle={styles.loginButtonText}
          onPress={() => navigation.navigate('LoginPage')}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#335441',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#335441',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  signupButton: {
    width: '100%',
    backgroundColor: '#335441',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginRedirect: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPrompt: {
    color: '#808080',
    marginRight: 10,
  },
  loginButton: {
    backgroundColor: 'transparent',
  },
  loginButtonText: {
    color: '#335441',
    fontWeight: 'bold',
  },
});

export default SignupPage;

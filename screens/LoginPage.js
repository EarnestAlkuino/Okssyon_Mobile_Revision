import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import Button from '../Components/Button'; // Reusable button component
import { supabase } from '../supabase'; // Assuming you have configured Supabase

const LoginPage = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Sign in function
  async function signInWithEmail() {
    setLoading(true);

    // Sign in using Supabase's auth system
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("Login Error", error.message); // Show alert for error
      setLoading(false);
      return; // Exit the function if there is an error
    }

    // Ensure that data and user exist
    const user = data?.user;

    if (!user) {
      Alert.alert("Login Error", "User not found or authentication failed.");
      setLoading(false);
      return;
    }

    // Fetch user profile after successful login
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id) // Use user.id to query the profile
      .single();

    if (profileError) {
      Alert.alert('Error fetching profile:', profileError.message);
      setLoading(false);
      return;
    }

    // Show welcome message with user's full name
    Alert.alert(`Welcome, ${profile.full_name}!`);
    // Pass userId to MainTabs so it can propagate through other screens
    navigation.navigate('MainTabs', { userId: user.id });

    setLoading(false);
  }

  return (
    <View style={styles.container}>
      {/* Input fields */}
      <View style={styles.inputContainer}>
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
        <Button
          title="Forgot Password?"
          onPress={() => navigation.navigate('ForgotPasswordScreen')}
          style={{ backgroundColor: 'transparent' }}
          textStyle={styles.forgotPasswordText}
        />
      </View>

      {/* Login Button */}
      <Button
        title="Log In"
        style={styles.loginButton}
        textStyle={styles.loginButtonText}
        onPress={signInWithEmail}
        disabled={loading}
      />

      {/* OR Text */}
      <Text style={styles.orText}>OR</Text>

      {/* Sign Up Navigation */}
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpPrompt}>Don't have an account?</Text>
        <Button
          title="Sign Up"
          onPress={() => navigation.navigate('SignUpPage')} // Navigate to SignUpPage
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
  forgotPasswordText: {
    alignSelf: 'flex-end',
    color: '#808080', // Light grey text
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#335441', // Dark green background
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  orText: {
    fontSize: 16,
    color: '#808080',
    marginVertical: 20,
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

export default LoginPage;

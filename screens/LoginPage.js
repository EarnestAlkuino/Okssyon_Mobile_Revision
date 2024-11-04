import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Image } from 'react-native';
import Button from '../Components/Button'; // Reusable button component
import { supabase } from '../supabase'; // Assuming you have configured Supabase

const LoginPage = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Sign in function
  async function signInWithEmail() {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("Login Error", error.message);
      setLoading(false);
      return;
    }

    const user = data?.user;

    if (!user) {
      Alert.alert("Login Error", "User not found or authentication failed.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    if (profileError) {
      Alert.alert('Error fetching profile:', profileError.message);
      setLoading(false);
      return;
    }

    Alert.alert(`Welcome, ${profile.full_name}!`);
    navigation.navigate('MainTabs', { userId: user.id });
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require('../assets/logo1.png')} style={styles.logo} />

      {/* Welcome and Subtext */}
      <View style={styles.textContainer}>
        <Text style={styles.welcomeText}>Welcome!</Text>
        <Text style={styles.subText}>Sign in to continue</Text>
      </View>

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
        <View style={styles.forgotPasswordContainer}>
          <Button
            title="Forgot Password?"
            onPress={() => navigation.navigate('ForgotPasswordScreen')}
            style={styles.forgotPasswordButton}
            textStyle={styles.forgotPasswordText}
          />
        </View>
      </View>

      {/* Login Button */}
      <Button
        title="Log In"
        style={styles.loginButton}
        textStyle={styles.loginButtonText}
        onPress={signInWithEmail}
        disabled={loading}
      />

      {/* Sign Up Navigation */}
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpPrompt}>Don't have an account? </Text>
        <Button
          title="Sign Up"
          onPress={() => navigation.navigate('SignUpPage')}
          style={styles.signUpButton}
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
    alignItems: 'flex-start',
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
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 30,
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
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#335441',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
  },
  forgotPasswordButton: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
  },
  forgotPasswordText: {
    color: '#808080',
    fontSize: 15,
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#335441',
    paddingVertical: 12,
    borderRadius: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signUpPrompt: {
    color: '#808080',
  },
  signUpButton: {
    backgroundColor: 'transparent',
  },
  signUpText: {
    color: '#335441',
    fontWeight: 'bold',
  },
});

export default LoginPage;

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Button from '../Components/Button';
import { supabase } from '../supabase';

const SignUpPage = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }
  
    if (!fullName || !email || !password) {
      Alert.alert('Please fill in all fields.');
      return;
    }
  
    setLoading(true);
  
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
  
      if (error) {
        if (error.message.includes('already registered')) {
          Alert.alert('Email Already Used', 'This email is already registered. Please log in or use a different email.');
        } else {
          Alert.alert('Error Signing Up', error.message);
        }
        setLoading(false);
        return;
      }
  
      // Navigate to the OTP verification page
      Alert.alert('Success', 'Please check your email for the OTP.');
      navigation.navigate('OtpPage', { email, fullName });
    } catch (err) {
      Alert.alert('Unexpected Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }
  
  

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo1.png')} style={styles.logo} />

      <View style={styles.textContainer}>
        <Text style={styles.welcomeText}>Create Account!</Text>
        <Text style={styles.subText}>Sign up to get started</Text>
      </View>

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
        <View style={[styles.input, styles.passwordContainer]}>
          <TextInput
            style={styles.passwordInput}
            placeholder="PASSWORD"
            placeholderTextColor="#808080"
            secureTextEntry={!isPasswordVisible}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(!isPasswordVisible)}
            style={styles.eyeIconContainer}
          >
            <Icon
              name={isPasswordVisible ? 'visibility' : 'visibility-off'}
              size={24}
              color="#808080"
            />
          </TouchableOpacity>
        </View>
        <View style={[styles.input, styles.passwordContainer]}>
          <TextInput
            style={styles.passwordInput}
            placeholder="CONFIRM PASSWORD"
            placeholderTextColor="#808080"
            secureTextEntry={!isConfirmPasswordVisible}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setConfirmPasswordVisible(!isConfirmPasswordVisible)}
            style={styles.eyeIconContainer}
          >
            <Icon
              name={isConfirmPasswordVisible ? 'visibility' : 'visibility-off'}
              size={24}
              color="#808080"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Sign Up"
          style={styles.signUpButton}
          textStyle={styles.signUpButtonText}
          onPress={signUpWithEmail}
          disabled={loading}
        />
      </View>

      <View style={styles.loginContainer}>
        <Text style={styles.loginPrompt}>Already have an account?</Text>
        <Button
          title="Log In"
          onPress={() => navigation.navigate('LoginPage')}
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
    marginBottom: 10,
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#335441',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    width: '100%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  eyeIconContainer: {
    padding: 5,
  },
  buttonContainer: {
    width: '100%',
  },
  signUpButton: {
    backgroundColor: '#335441',
    paddingVertical: 10,
    borderRadius: 10,
    width: '100%',
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
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


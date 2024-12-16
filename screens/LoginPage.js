import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Button from '../Components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For storing user preferences
import { supabase } from '../supabase';

const LoginPage = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const loadRememberedEmail = async () => {
      const savedEmail = await AsyncStorage.getItem('rememberedEmail');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    };
    loadRememberedEmail();
  }, []);

  async function signInWithEmail() {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Login Error', error.message);
      setLoading(false);
      return;
    }

    const user = data?.user;

    if (!user) {
      Alert.alert('Login Error', 'User not found or authentication failed.');
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

    if (rememberMe) {
      await AsyncStorage.setItem('rememberedEmail', email);
    } else {
      await AsyncStorage.removeItem('rememberedEmail');
    }
    
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
          placeholder="Email"
          placeholderTextColor="#808080"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#808080"
            secureTextEntry={!isPasswordVisible}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.icon}
            onPress={() => setPasswordVisible(!isPasswordVisible)}
          >
            <Icon
              name={isPasswordVisible ? 'visibility' : 'visibility-off'}
              size={24}
              color="#808080"
            />
          </TouchableOpacity>
        </View>

        {/* Remember Me and Forgot Password */}
        <View style={styles.inlineContainer}>
          <TouchableOpacity
            style={styles.rememberMeContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <Icon
              name={rememberMe ? 'check-box' : 'check-box-outline-blank'}
              size={24}
              color="#335441"
            />
            <Text style={styles.rememberMeText}>Remember Me</Text>
          </TouchableOpacity>

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
    paddingRight: 45,
    marginBottom: 15,
  },
  passwordWrapper: {
    position: 'relative',
    width: '100%',
  },
  icon: {
    position: 'absolute',
    right: 15,
    top: 10,
  },
  inlineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    color: '#335441',
    marginLeft: 5,
    fontSize: 15,
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
    marginTop: 15,
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

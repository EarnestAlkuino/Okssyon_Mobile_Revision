import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase';

const OtpPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params;
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [resendTimer, setResendTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleOtpChange = (value, index) => {
    if (/^\d$/.test(value) || value === '') {
      const updatedOtp = [...otp];
      updatedOtp[index] = value;
      setOtp(updatedOtp);

      // Move to the next input field
      if (value && index < 5) inputRefs.current[index + 1]?.focus();
      // Move to the previous field if cleared
      if (!value && index > 0) inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) {
      Alert.alert(`Please wait for ${resendTimer}s before resending OTP.`);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({ email });

      if (error) {
        Alert.alert('Resend Failed', `Error: ${error.message}`);
        return;
      }

      setResendTimer(60);
      Alert.alert('OTP Resent', `A new OTP has been sent to ${email}.`);
    } catch (err) {
      Alert.alert('Error', 'Could not resend OTP.');
    }
  };

  const handleSubmitOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP.');
      return;
    }
  
    setLoading(true);
  
    try {
      const { error, data } = await supabase.auth.verifyOtp({
        email,
        token: otpString,
        type: 'signup', // Specify the type for signup verification
      });
  
      if (error) {
        Alert.alert('Verification Failed', error.message);
        return;
      }
  
      // Add user to profiles table after email verification
      const user = data.user;
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ id: user.id, full_name: route.params.fullName, email }]);
  
        if (profileError) {
          Alert.alert('Error Adding Profile', profileError.message);
          return;
        }
  
        Alert.alert('Success', 'Your account has been verified!');
        navigation.replace('LoginPage');
      }
    } catch (err) {
      Alert.alert('Unexpected Error', 'An error occurred during OTP verification.');
    } finally {
      setLoading(false);
    }
  };
  
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back-outline" size={30} color="#333" />
        </TouchableOpacity>
        <Image source={require('../assets/commu.png')} style={styles.icon} />
        <Text style={styles.headerText}>Verify Your Account</Text>
        <Text style={styles.subHeaderText}>
          Enter the 6-digit OTP sent to <Text style={styles.emailText}>{email}</Text>.
        </Text>
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              style={styles.otpBox}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              keyboardType="numeric"
              maxLength={1}
            />
          ))}
        </View>
        <TouchableOpacity
          style={styles.resendContainer}
          onPress={handleResendOtp}
          disabled={resendTimer > 0}
        >
          <Text style={[styles.resendText, resendTimer > 0 && styles.resendDisabled]}>
            Resend OTP {resendTimer > 0 && `(${resendTimer}s)`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmitOtp}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  /* Styles from your original code */
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  icon: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
  },
  emailText: {
    fontWeight: 'bold',
    color: '#335441',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginVertical: 40,
  },
  otpBox: {
    backgroundColor: '#F1F1F1',
    borderRadius: 5,
    padding: 10,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    fontSize: 18,
    textAlign: 'center',
    width: '15%',
  },
  resendContainer: {
    marginBottom: 20,
  },
  resendText: {
    fontSize: 14,
    color: '#335441',
    textDecorationLine: 'underline',
  },
  resendDisabled: {
    color: '#CCC',
  },
  submitButton: {
    backgroundColor: '#335441',
    paddingVertical: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    marginBottom: 180,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#AAA',
  },
});

export default OtpPage;

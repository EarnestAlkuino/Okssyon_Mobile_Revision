import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons'; 

const ConfirmForgotPass = () => {
    const navigation = useNavigation();

    return ( // Wrap the JSX with a return statement
        <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Lock Icon */}
            <Image 
                source={require('../assets/forgot.png')}  
                style={styles.lockIcon} // Apply styles to the lock icon
            />

            {/* Title */}
            <Text style={styles.title}>Forgot Password</Text>

            {/* New Password Input */}
            <TextInput 
                placeholder="New Password" 
                placeholderTextColor="#A0A0A0" 
                style={styles.input} 
                secureTextEntry={true} // To hide the password input
            />

            {/* Confirm Password Input */}
            <TextInput 
                placeholder="Confirm Password" 
                placeholderTextColor="#A0A0A0" 
                style={styles.input} 
                secureTextEntry={true} // To hide the password input
            />

            {/* Confirm Button */}
            <TouchableOpacity style={styles.nextButton} onPress={() => {/* Add action here */}}>
                <Text style={styles.nextButtonText}>Confirm</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ConfirmForgotPass;

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
  lockIcon: { // Lock icon styles
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

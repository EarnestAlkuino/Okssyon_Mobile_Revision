import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const faqs = [
  {
    question: 'How do I create, update, and delete an account?',
    answer: 'To create an account, go to the sign-up page and fill in the required information. For updates, visit your profile and edit the details. To delete your account, contact support for assistance.',
  },
  {
    question: 'How do I recover my password?',
    answer: 'Go to the login page and select "Forgot Password". Enter your registered email, and a reset link will be sent to you.',
  },
  {
    question: 'What payment methods are available?',
    answer: 'We accept credit cards, PayPal, and other payment methods depending on your region. For more details, visit the Billing section under your profile.',
  },
  {
    question: 'How is my data protected?',
    answer: 'Your data is protected with industry-standard encryption and is only accessible by authorized personnel. You can adjust privacy settings in your account settings.',
  },
  {
    question: 'What features does the app offer?',
    answer: 'Our app offers a variety of features including navigation tools, search functionality, and the ability to save favorites for easy access.',
  },
];

const HelpPage = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#405e40" />
        </TouchableOpacity>
        <Image source={require('../assets/logo1.png')} style={styles.logo} />
      </View>
      <Text style={styles.title}>Frequently Asked Questions</Text>
      {faqs.map((faq, index) => (
        <View key={index} style={styles.faqContainer}>
          <TouchableOpacity onPress={() => toggleFAQ(index)} style={styles.questionContainer}>
            <Text style={styles.questionText}>{faq.question}</Text>
            <Ionicons name={activeIndex === index ? 'chevron-up' : 'chevron-down'} size={20} color="#405e40" />
          </TouchableOpacity>
          {activeIndex === index && <Text style={styles.answerText}>{faq.answer}</Text>}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Space between back button and logo
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  logo: {
    width: 100,  // Adjust logo size as needed
    height: 40,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#405e40',
    textAlign: 'center',
    marginBottom: 20,
  },
  faqContainer: {
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#405e40',
  },
  answerText: {
    marginTop: 10,
    fontSize: 14,
    color: '#606060',
  },
});

export default HelpPage;

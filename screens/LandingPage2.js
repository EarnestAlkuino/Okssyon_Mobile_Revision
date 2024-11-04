import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Button from '../Components/Button'; // Import the Button component

const LandingPage2 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      

      <Text style={styles.tagline}>
      <Text style={styles.highlightedText1}>Empowering </Text> 
      <Text style={styles.highlightedText2}>farmers</Text>, 
      <Text style={styles.highlightedText3}>Tranforming </Text> 
      <Text style={styles.highlightedText4}>auctions</Text>.
      </Text>

    
      <Button
        title="GET STARTED"
        onPress={() => navigation.navigate('LandingPage3')} 
        style={styles.getStartedButton} 
        textStyle={styles.getStartedButtonText} 
      />

      
      <View style={styles.dotIndicator}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
      </View>
    </View>
  );
};

export default LandingPage2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  tagline: {
    fontSize: 16,
    fontWeight: 'bold', 
    color: '#333',
    marginVertical: 20,
    textAlign: 'center',
  },
  highlightedText1: {
    color: '#DFAE47',
  },
  highlightedText2: {
    color: '#335441', 
  },
  highlightedText3: {
    color: '#DFAE47',
  },
  highlightedText4: {
    color: '#335441', 
  },
  getStartedButton: {
    marginTop: 20,
    width: '80%',
    backgroundColor: '#335441', 
    paddingVertical: 8,
    borderRadius: 12, 
    elevation: 2,
    top: 100,
  },
  getStartedButtonText: {
    fontSize: 18, 
    color: '#FFF', 
    fontWeight: 'bold',
  },
  dotIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
    top: 140,
    left: 80,
  },
  activeDot: {
    backgroundColor: '#405e40', 
  },
});




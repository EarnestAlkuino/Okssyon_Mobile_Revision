// Header.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const Header = ({ 
  title, 
  showBackButton = true, 
  showSettingsButton = true, 
  onBackPress, 
  onSettingsPress, 
  leftIcon = "arrow-back", 
  rightIcon = "settings", 
  leftIconColor = "white", 
  rightIconColor = "white" 
}) => {
  return (
    <LinearGradient
      colors={['#257446', '#234D35']}
      style={styles.header}
    >
      <StatusBar barStyle="light-content" />
      
      <View style={styles.headerContent}>
        {showBackButton && (
          <TouchableOpacity onPress={onBackPress}>
            <Ionicons name={leftIcon} size={24} color={leftIconColor} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
        {showSettingsButton && (
          <TouchableOpacity onPress={onSettingsPress}>
            <Ionicons name={rightIcon} size={24} color={rightIconColor} />
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 100,
    bottom: 20,
    paddingTop: StatusBar.currentHeight || 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Header;

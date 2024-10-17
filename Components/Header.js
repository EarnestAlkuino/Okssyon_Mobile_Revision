import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
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
    <>
      {/* Make the StatusBar transparent to allow the gradient to flow under it */}
      <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />

      {/* Wrap everything in LinearGradient, including the top SafeArea */}
      <LinearGradient
        colors={['#257446', '#234D35']}
        style={styles.gradient}
      >
        {/* SafeAreaView ensures the content doesn't overlap with notches or status bar */}
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerContent}>
            {showBackButton && (
              <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
                <Ionicons name={leftIcon} size={24} color={leftIconColor} />
              </TouchableOpacity>
            )}
            <Text style={styles.title}>{title}</Text>
            {showSettingsButton && (
              <TouchableOpacity onPress={onSettingsPress} style={styles.iconButton}>
                <Ionicons name={rightIcon} size={24} color={rightIconColor} />
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  gradient: {
    paddingBottom: 20, // Padding to ensure content isn't too close to bottom
  },
  safeArea: {
    paddingTop: StatusBar.currentHeight || 0, // Make sure to account for status bar height
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, // Adjust padding to keep layout balanced
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
});

export default Header;

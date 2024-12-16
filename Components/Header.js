import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Header = ({
  title,
  showBackButton = true,
  showSettingsButton = false,
  onBackPress,
  onSettingsPress,
  onNewMessagePress,
  leftIcon = "arrow-back",
  rightIcon = "settings",
  newMessageIcon = "create-outline",
  leftIconColor = "#000", // Default to black for simplicity
  rightIconColor = "#000",
}) => {
  return (
    <>
      <StatusBar translucent barStyle="dark-content" backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          {/* Left Button */}
          {showBackButton && (
            <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
              <Ionicons name={leftIcon} size={24} color={leftIconColor} />
            </TouchableOpacity>
          )}

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Right Buttons */}
          <View style={styles.rightIcons}>
            {onNewMessagePress && (
              <TouchableOpacity onPress={onNewMessagePress} style={styles.iconButton}>
                <Ionicons name={newMessageIcon} size={24} color={rightIconColor} />
              </TouchableOpacity>
            )}
            {showSettingsButton && (
              <TouchableOpacity onPress={onSettingsPress} style={styles.iconButton}>
                <Ionicons name={rightIcon} size={24} color={rightIconColor} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff', // Light background for a clean look
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0', // Subtle border for separation
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333', // Neutral text color for clarity
    flex: 1,
    textAlign: 'center',
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Header;

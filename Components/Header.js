import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  leftIconColor = "white",
  rightIconColor = "white",
}) => {
  return (
    <>
      <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />
      <LinearGradient colors={['#257446', '#1f4b33', '#1b3f2b']} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerContent}>
            {showBackButton && (
              <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
                <Ionicons name={leftIcon} size={24} color={leftIconColor} />
              </TouchableOpacity>
            )}
            <Text style={styles.title}>{title}</Text>
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
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  gradient: {
    paddingBottom: 30,
    elevation: 5,
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 5 }, 
    shadowOpacity: 0.5, 
    shadowRadius: 3,
  },
  safeArea: {
    paddingTop: StatusBar.currentHeight || 10, 
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  title: {
    color: 'white',
    fontSize: 18, 
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 35, 
    height: 35,
    borderRadius: 17.5,
  },
});

export default Header;

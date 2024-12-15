import React from 'react';
import AppNavigator from './navigation/AppNavigator'; // Your custom navigator
import { StatusBar, SafeAreaView } from 'react-native';
import { Buffer } from 'buffer';

// Set up global Buffer for environments that need it (e.g., using libraries that rely on Buffer)
global.Buffer = Buffer;

export default function App() {
  return (
    <>
      {/* Set the status bar style and background color */}
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* SafeAreaView to avoid content overlapping with status bar */}
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <AppNavigator />
      </SafeAreaView>
    </>
  );
}

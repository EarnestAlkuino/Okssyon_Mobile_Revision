import React from 'react';
import { WebView } from 'react-native-webview';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const PaymentWebView = ({ route }) => {
    const { clientKey } = route.params;
  
    if (!clientKey) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Client Key is missing</Text>
        </View>
      );
    }
  
    const url = `https://your-payment-page.com/?client_key=${clientKey}`; // Replace with your actual payment URL
  
    return (
      <WebView
        source={{ uri: url }}
        style={{ flex: 1 }}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#257446" />
          </View>
        )}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView Error:', nativeEvent);
        }}
      />
    );
  };
  

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PaymentWebView;

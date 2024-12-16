// Components/LivestockAuctionDetailPage/AuctionImage.js
import React, { useState } from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';

const AuctionImage = ({ imageUrl }) => {
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <View style={styles.imageContainer}>
      {imageLoading && <ActivityIndicator size="large" color="#405e40" style={styles.imageLoader} />}
      <Image
        style={styles.mainImage}
        source={{ uri: imageUrl || 'https://via.placeholder.com/300' }}
        onLoadEnd={() => setImageLoading(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageLoader: {
    position: 'absolute',
    zIndex: 1,
  },
});

export default AuctionImage;

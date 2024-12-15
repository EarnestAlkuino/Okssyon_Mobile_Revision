import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const ItemImage = ({ imageUrl }) => (
  <View style={styles.imageContainer}>
    <Image
      style={styles.mainImage}
      source={{ uri: imageUrl || 'https://via.placeholder.com/300' }}
    />
  </View>
);

const styles = StyleSheet.create({
  imageContainer: {
    width: '100%',
    height: 220,
    backgroundColor: '#f8f8f8',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default ItemImage;

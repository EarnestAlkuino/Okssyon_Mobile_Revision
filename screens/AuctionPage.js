import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Make sure to install this package for icons

const auctionCategories = [
  { id: '1', title: 'Cattle', icon: require('../assets/iconCattle.png') },
  { id: '2', title: 'Horse', icon: require('../assets/iconHorse.png') },
  { id: '3', title: 'Pig', icon: require('../assets/iconPig.png') },
  { id: '4', title: 'Carabao', icon: require('../assets/iconCrabao.png') },
  { id: '5', title: 'Goat', icon: require('../assets/iconGoat.png') },
];

const AuctionPage = ({ route, navigation }) => {
  const { category } = route.params;
  const [selectedCategory, setSelectedCategory] = useState(category);

  const handleCategorySelect = (newCategory) => {
    setSelectedCategory(newCategory);
    navigation.navigate('AuctionPage', { category: newCategory });
  };

  const renderCategoryIcons = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconContainer}>
      {auctionCategories.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.iconWrapper}
          onPress={() => handleCategorySelect(item.title)}
        >
          <Image
            source={item.icon}
            style={[
              styles.icon,
              selectedCategory === item.title && styles.iconSelected,
            ]}
          />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Hide the status bar */}
      <StatusBar hidden={true} />

      {/* Background Container */}
      <View style={styles.backgroundContainer}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton} // Position the back button
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#335441" />
        </TouchableOpacity>

        {/* Logo */}
        <Image source={require('../assets/logo1.png')} style={styles.logo} />

        {/* Search Button */}
        <TouchableOpacity
          style={styles.searchButton} // Position the search button
        >
          <Ionicons name="search" size={24} color="#335441" />
        </TouchableOpacity>

        {/* Category Icons */}
        {renderCategoryIcons()}
      </View>

      {/* Selected Category Display */}
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to {selectedCategory} Auctions</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    backgroundColor: 'rgba(182, 194, 148, 0.21)', // Background color for both header and icons
    paddingBottom: 10,
    paddingTop: 0, // No padding at the top, start from the very top of the screen
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    position: 'relative', // Enables absolute positioning inside this container
  },
  backButton: {
    position: 'absolute',
    top: 10, // Adjust this value for vertical positioning
    left: 10, // Adjust this value for horizontal positioning
    zIndex: 1, // Ensure the button stays on top of other elements
  },
  searchButton: {
    position: 'absolute',
    top: 10, // Adjust this value for vertical positioning
    right: 10, // Adjust this value for horizontal positioning
    zIndex: 1, // Ensure the button stays on top of other elements
  },
  logo: {
    width: 150, // Adjusted size
    height: 50,
    resizeMode: 'contain',
    alignSelf: 'center', // Center the logo horizontally
    marginTop: 10, // Adjust for spacing between the logo and top
  },
  iconContainer: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingVertical: 10,
    marginTop: 20, // Space between the icons and the logo
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  icon: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  iconSelected: {
    width: 80,
    height: 80,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#335441',
  },
});

export default AuctionPage;1
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
            style={[styles.icon, selectedCategory === item.title && styles.iconSelected]}
          />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* StatusBar with transparent background */}
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      <View style={styles.backgroundContainer}>
        <TouchableOpacity
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#335441" />
        </TouchableOpacity>

        <Image source={require('../assets/logo1.png')} style={styles.logo} />

        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#335441" />
        </TouchableOpacity>

        {renderCategoryIcons()}
      </View>

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
    backgroundColor: 'rgba(182, 194, 148, 0.21)', 
    paddingBottom: 10,
    paddingTop: 10, // Optional padding at the top
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    position: 'relative', 
  },
  backButton: {
    position: 'absolute',
    top: 45, 
    left: 29, 
    zIndex: 1, 
  },
  searchButton: {
    position: 'absolute',
    top: 45, 
    right: 29, 
  
    zIndex: 1, 
  },
  logo: {
    width: 150,
    height: 50,
    resizeMode: 'contain',
    alignSelf: 'center', 
    marginTop: 35, 
  },
  iconContainer: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingVertical: 10,
    marginTop: 20, 
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

export default AuctionPage;

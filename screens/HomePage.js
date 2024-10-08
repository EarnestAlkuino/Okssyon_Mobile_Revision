import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList } from 'react-native';


const auctionCategories = [
  { id: '1', title: 'Cattle Auctions', icon: require('../assets/cattle.png') },
  { id: '2', title: 'Horse Auctions', icon: require('../assets/horse.png') },
  { id: '3', title: 'Carabao Auctions', icon: require('../assets/carabao.png') },
  { id: '4', title: 'Pig Auctions', icon: require('../assets/pig.png') },
  { id: '5', title: 'Sheep Auctions', icon: require('../assets/sheep.png') },
  { id: '6', title: 'Goat Auctions', icon: require('../assets/goat.png') },
];

const HomePage = ({ navigation }) => {
  
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryContainer}
      onPress={() => navigation.navigate('AuctionPage', { category: item.title })} 
    >
      <Image source={item.icon} style={styles.categoryIcon} />
      <Text style={styles.categoryTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Logo at the top */}
      <Image source={require('../assets/logo1.png')} style={styles.logo} />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Image source={require('../assets/Search.png')} style={styles.searchIcon} />
        <Text style={styles.searchText}>Search</Text>
      </View>

      {/* Grid of Auction Categories */}
      <FlatList
        data={auctionCategories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 60,
    backgroundColor: '#fff',
  },
  logo: {
    width: 200,
    height: 60,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',  
    borderRadius: 10,           
    padding: 10,                 
    marginBottom: 20,            
    width: '110%',               
    height: 38,                  
    alignSelf: 'center',
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  searchText: {
    fontSize: 16,
    color: '#808080',
  },
  grid: {
    justifyContent: 'center',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  categoryContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  categoryIcon: {
    width: 100, 
    height: 100, 
    resizeMode: 'contain',  
    marginBottom: 2,  
  },
  categoryTitle: {
    fontSize: 14,
    color: '#405e40',  
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default HomePage;

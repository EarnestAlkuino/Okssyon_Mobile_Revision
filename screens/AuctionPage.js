import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { supabase } from '../supabase';

const categories = [
  { name: 'Cattle', value: 'cattle', icon: require('../assets/iconCattle.png') },
  { name: 'Horse', value: 'horse', icon: require('../assets/iconHorse.png') },
  { name: 'Pig', value: 'pig', icon: require('../assets/iconPig.png') },
  { name: 'Carabao', value: 'carabao', icon: require('../assets/iconCrabao.png') },
  { name: 'Goat', value: 'goat', icon: require('../assets/iconGoat.png') },
  { name: 'Sheep', value: 'sheep', icon: require('../assets/iconSheep.png') },
];

const AuctionPage = ({ navigation, route }) => {
  const { userId } = route.params;
  const [livestockData, setLivestockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('cattle'); // Default category

  useEffect(() => {
    const fetchLivestockData = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('livestock')
        .select('*')
        .eq('category', selectedCategory);

      if (error) {
        Alert.alert("Error", "Failed to fetch livestock data.");
      } else {
        setLivestockData(data);
      }
      
      setLoading(false);
    };

    fetchLivestockData();
  }, [selectedCategory]);

  const handleLivestockSelect = (item) => {
    navigation.navigate('LivestockAuctionDetailPage', { itemId: item.id, userId });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleLivestockSelect(item)}>
      <Image
        source={{ uri: item.image_uri || 'https://via.placeholder.com/100' }}
        style={styles.image}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.categoryText}>{item.category}</Text>
        <Text style={styles.detailsText}>Breed: {item.breed || 'Unknown'}</Text>
        <Text style={styles.detailsText}>Location: {item.location || 'Not specified'}</Text>
        <Text style={styles.detailsText}>Weight: {item.weight} kg</Text>
        <Text style={styles.detailsText}>Starting Price: ₱{item.starting_price?.toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = (category) => (
    <TouchableOpacity
      key={category.value}
      style={styles.categoryButton}
      onPress={() => setSelectedCategory(category.value)}
    >
      <Image
        source={category.icon}
        style={[
          styles.categoryIcon,
          selectedCategory === category.value && styles.selectedCategoryIcon, // Enlarged icon if selected
        ]}
      />
      <Text style={styles.categoryName}>{category.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#405e40" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScrollView}>
        {categories.map(renderCategory)}
      </ScrollView>
      <Text style={styles.header}>Available {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}</Text>
      <FlatList
        data={livestockData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#335441',
    marginVertical: 10,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
    paddingLeft: 10,
  },
  categoryText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#335441',
    marginBottom: 5,
  },
  detailsText: {
    fontSize: 15,
    color: '#555',
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryScrollView: {
    marginVertical: 10,
  },
  categoryButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 5,
  },
  categoryIcon: {
    width: 35,
    height: 35,
    marginBottom: 5,
  },
  selectedCategoryIcon: {
    width: 45, // Enlarged width for selected icon
    height: 45, // Enlarged height for selected icon
  },
  categoryName: {
    fontSize: 12,
    color: '#335441',
  },
});

export default AuctionPage;

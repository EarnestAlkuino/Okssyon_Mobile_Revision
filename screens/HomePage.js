import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import CattleIcon from '../assets/Cattle1.svg';
import HorseIcon from '../assets/Horse1.svg';
import SheepIcon from '../assets/Sheep1.svg';
import CarabaoIcon from '../assets/Carabao1.svg';
import GoatIcon from '../assets/Goat1.svg';
import PigIcon from '../assets/Pig1.svg';

const HomePage = ({ navigation }) => {
  const [userName, setUserName] = useState('John Doe');
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState('Upcoming Auction!');
  const [announcementDate, setAnnouncementDate] = useState('October 20, 2024');
  
  useEffect(() => {
    const fetchAdminData = () => {
      setAnnouncement('Biggest Auction Event!');
      setAnnouncementDate('October 22, 2024');
      setLoading(false);
    };
    fetchAdminData();
  }, []);

  const auctionCategories = [
    { id: '1', title: 'Cattle Auctions', Icon: CattleIcon },
    { id: '2', title: 'Horse Auctions', Icon: HorseIcon },
    { id: '3', title: 'Sheep Auctions', Icon: SheepIcon },
    { id: '4', title: 'Carabao Auctions', Icon: CarabaoIcon },
    { id: '5', title: 'Goat Auctions', Icon: GoatIcon },
    { id: '6', title: 'Pig Auctions', Icon: PigIcon },
  ];

  const renderCategoryItem = ({ item }) => {
    const IconComponent = item.Icon;
    return (
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => navigation.navigate('AuctionPage', { category: item.title })}
      >
        <View style={styles.iconContainer}>
          <IconComponent width={80} height={80} fill="#405e40" />
        </View>
      </TouchableOpacity>
    );
  };

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
      <View style={styles.topSection}>
        <Text style={styles.helloText}>Hello, {userName}</Text>
        <TouchableOpacity style={styles.searchIcon} onPress={() => navigation.navigate('SearchPage')}>
          <Ionicons name="search" size={24} color="#405e40" />
        </TouchableOpacity>
      </View>

      <ImageBackground source={require('../assets/HEADER1.png')} style={styles.header}>
        <View style={styles.announcementOverlay}>
          <Text style={styles.headerText}>{announcement}</Text>
          <Text style={styles.headerDate}>Date: {announcementDate}</Text>
        </View>
      </ImageBackground>

      <LinearGradient colors={['#B9D370', '#71BA90']} style={styles.gradientButton}>
        <TouchableOpacity onPress={() => navigation.navigate('PnsPage')}>
          <Text style={styles.gradientButtonText}>View latest PNS</Text>
        </TouchableOpacity>
      </LinearGradient>

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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  helloText: {
    fontSize: 20,
    color: '#405e40',
    fontWeight: 'bold',
  },
  searchIcon: {
    padding: 5,
  },
  header: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    aspectRatio: 5 / 3,
    borderRadius: 20,
  },
  announcementOverlay: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
  },
  headerText: {
    fontSize: 24,
    color: '#234D35',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  headerDate: {
    fontSize: 18,
    color: '#234D35',
    textAlign: 'center',
    marginBottom: 30,
  },
  gradientButton: {
    alignItems: 'center',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    marginTop: 20,
    marginHorizontal: 22,
  },
  gradientButtonText: {
    fontSize: 16,
    color: '#335441',
    fontWeight: 'bold',
  },
  iconButton: {
    flex: 1,
    alignItems: 'center',
    marginVertical: 10,
  },
  iconContainer: {
    width: 120,
    height: 100,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  columnWrapper: {
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  grid: {
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
});

export default HomePage;

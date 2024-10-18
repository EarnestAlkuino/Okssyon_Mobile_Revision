import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
    { id: '1', Icon: CattleIcon,  },
    { id: '2', Icon: HorseIcon,  },
    { id: '3', Icon: SheepIcon,},
    { id: '4', Icon: CarabaoIcon,  },
    { id: '5', Icon: GoatIcon,},
    { id: '6', Icon: PigIcon, },
  ];

  const renderCategoryItem = ({ item }) => {
    const IconComponent = item.Icon;

    return (
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => navigation.navigate('AuctionPage', { category: item.title })}
      >
        <View style={styles.iconContainer}>
          <IconComponent width={88} height={90} fill="#ffffff" />
          <Text style={styles.categoryTitle}>{item.title}</Text>
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

      {/* Announcement Banner with Centered Text */}
      <LinearGradient
        colors={['rgba(185, 211, 112, 0.8)', 'rgba(113, 186, 144, 0.8)']}
        style={styles.announcementBanner}
      >
        <Text style={styles.announcementText}>{announcement}</Text>
        <Text style={styles.announcementDate}>{announcementDate}</Text>
      </LinearGradient>

      <LinearGradient colors={['#257446', '#234D35']} style={styles.gradientButton}>
        <TouchableOpacity style={styles.fullWidthButton} onPress={() => navigation.navigate('PnsPage')}>
          <Text style={styles.gradientButtonText}>View latest PNS</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Livestock Selection Label */}
      <Text style={styles.selectionLabel}>LIVESTOCK AUCTION SELECTION</Text>

      <FlatList
        data={auctionCategories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        numColumns={3} // Set to 3 for a 3-column layout
        columnWrapperStyle={styles.columnWrapper} // Adjusts spacing between items
        contentContainerStyle={styles.grid}
      />
    </View>
  );
};

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
    top: 25,
    paddingVertical: 50, // Reduced vertical padding for better alignment
  },
  helloText: {
    fontSize: 20,
    color: '#405e40',
    fontWeight: 'bold',
  },
  searchIcon: {
    padding: 5,
  },
  announcementBanner: {
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 38,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  announcementText: {
    fontSize: 22,
    color: '#405e40',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  announcementDate: {
    fontSize: 16,
    color: '#405e40',
    textAlign: 'center',
  },
  gradientButton: {
    alignItems: 'center',
    borderRadius: 5,
    width: '90%',
    alignSelf: 'center',
    marginBottom: 10,
  },
  fullWidthButton: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
  },
  gradientButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  selectionLabel: {
    textAlign: 'left',
    fontSize: 16,
    color: '#405e40',
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 20,
  },
  iconButton: {
    flex: 1,
    alignItems: 'center',
    marginVertical: 15,
    width: '30%', // Set width to ensure items fit properly in three columns
  },
  iconContainer: {
    width: 108,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  categoryTitle: {
    marginTop: 5,
    fontSize: 14,
    color: '#405e40',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  columnWrapper: {
    justifyContent: 'space-between', // Ensures even spacing for 3 items
    marginBottom: -12,
  },
  grid: {
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
});

export default HomePage;

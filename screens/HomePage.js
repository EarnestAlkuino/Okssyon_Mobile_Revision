import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert, Image, Dimensions } from 'react-native'; // Added Dimensions
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../supabase';
import CattleIcon from '../assets/Cattle1.svg';
import HorseIcon from '../assets/Horse1.svg';
import SheepIcon from '../assets/Sheep1.svg';
import CarabaoIcon from '../assets/Carabao1.svg';
import GoatIcon from '../assets/Goat1.svg';
import PigIcon from '../assets/Pig1.svg';
import logo from '../assets/logo1.png';

const { width } = Dimensions.get('window');

const HomePage = ({ navigation, route }) => {
  const { userId: userIdFromRoute } = route.params || {};
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState('Upcoming Auction!');
  const [announcementDate, setAnnouncementDate] = useState('October 20, 2024');

  useEffect(() => {
    const fetchUserName = async () => {
      let userId = userIdFromRoute;

      if (!userId) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          Alert.alert('Error', userError?.message || 'No user found. Please log in again.');
          navigation.navigate('LoginPage');
          return;
        }
        userId = user.id;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      if (profileError) {
        Alert.alert('Error fetching profile data', profileError.message);
      } else {
        setUserName(profileData.full_name);
      }

      setLoading(false);
    };

    fetchUserName();
  }, [userIdFromRoute, navigation]);

  const auctionCategories = [
    { id: '1', title: 'Cattle', Icon: CattleIcon },
    { id: '2', title: 'Horse', Icon: HorseIcon },
    { id: '3', title: 'Sheep', Icon: SheepIcon },
    { id: '4', title: 'Carabao', Icon: CarabaoIcon },
    { id: '5', title: 'Goat', Icon: GoatIcon },
    { id: '6', title: 'Pig', Icon: PigIcon },
  ];

  const renderCategoryItem = ({ item }) => {
    const IconComponent = item.Icon;

    return (
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => {
          console.log("Navigating to AuctionPage with category:", item.title, "and userId:", userIdFromRoute);
          navigation.navigate('AuctionPage', { category: item.title, userId: userIdFromRoute });
        }}
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
        <View>
          <Text style={styles.helloText}>Hello, {userName}</Text>
          <Text style={styles.welcomeText}>Welcome! You can start bidding now.</Text>
        </View>
        <TouchableOpacity style={styles.searchIcon} onPress={() => navigation.navigate('SearchPage')}>
          <Ionicons name="search" size={24} color="#405e40" />
        </TouchableOpacity>
      </View>

      <Image source={logo} style={styles.logo} />

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

      <Text style={styles.selectionLabel}>Livestock Auction Selection</Text>

      <FlatList
        data={auctionCategories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.grid}
        style={styles.flatList}
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
    paddingHorizontal: 20,
    paddingVertical: 40,
    marginTop: 25,
  },
  helloText: {
    fontSize: 20,
    color: '#405e40',
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 14,
    color: '#405e40',
    marginTop: 4,
  },
  searchIcon: {
    padding: 5,
  },
  logo: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 100,
    height: 60,
    resizeMode: 'contain',
  },
  announcementBanner: {
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 38,
    paddingHorizontal: 15,
    alignItems: 'center',
    backgroundColor: '#e5f2e1',
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
    fontSize: 20,
    color: '#405e40',
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 10,
  },
  iconButton: {
    flex: 1,
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: width < 350 ? 8 : 12, // Adjust margins based on screen width
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 50,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  iconContainer: {
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 18,
    color: '#405e40',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  grid: {
    paddingBottom: 250,
  },
  flatList: {
    flex: 1,
  },

  // Livestock section with responsiveness
  livestockSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  livestockCard: {
    width: width < 350 ? '45%' : width < 600 ? '30%' : '24%', // Adjust width based on screen size
    marginVertical: 10,
    marginHorizontal: '1%',
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    alignItems: 'center',
    minWidth: 100,
  },
  livestockImage: {
    width: '60%',
    height: 80,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  livestockText: {
    fontSize: 16,
    color: '#405e40',
    fontWeight: 'bold',
  },

  largeScreen: {
    iconButton: {
      width: '40%',
    },
    livestockCard: {
      width: '24%',
    },
  },
});


export default HomePage;

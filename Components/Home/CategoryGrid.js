import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '../../supabase';
import CattleIcon from '../../assets/Cattle1.svg';
import HorseIcon from '../../assets/Horse1.svg';
import SheepIcon from '../../assets/Sheep1.svg';
import CarabaoIcon from '../../assets/Carabao1.svg';
import GoatIcon from '../../assets/Goat1.svg';
import PigIcon from '../../assets/Pig1.svg';

const categories = [
  { id: 'Cattle', title: 'Cattle', Icon: CattleIcon },
  { id: 'Horse', title: 'Horse', Icon: HorseIcon },
  { id: 'Sheep', title: 'Sheep', Icon: SheepIcon },
  { id: 'Carabao', title: 'Carabao', Icon: CarabaoIcon },
  { id: 'Goat', title: 'Goat', Icon: GoatIcon },
  { id: 'Pig', title: 'Pig', Icon: PigIcon },
];

const CategoryGrid = ({ navigation, userId }) => {
  const [auctionCounts, setAuctionCounts] = useState({});

  useEffect(() => {
    const fetchAuctionCounts = async () => {
      const { data, error } = await supabase
        .from('livestock')
        .select('category', { count: 'exact' })
        .eq('status', 'AVAILABLE') // Fetch only active auctions
        .group('category');

      if (error) {
        console.error('Error fetching auction counts:', error.message);
      } else {
        const counts = {};
        data.forEach(item => {
          counts[item.category] = item.count;
        });
        setAuctionCounts(counts);
      }
    };

    fetchAuctionCounts();

    // Optional: Set up real-time updates for auctions
    const auctionSubscription = supabase
      .channel('auction-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'livestock' },
        () => fetchAuctionCounts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(auctionSubscription);
    };
  }, []);

  return (
    <FlatList
      data={categories}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('AuctionPage', { category: item.title, userId })}
        >
          <View style={styles.iconContainer}>
            <item.Icon width={88} height={90} fill="#ffffff" />
            {auctionCounts[item.title] > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{auctionCounts[item.title]}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item.id}
      numColumns={3}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={styles.grid}
    />
  );
};

const styles = StyleSheet.create({
  iconButton: {
    flex: 1,
    alignItems: 'center',
    margin: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    minWidth: 100,
    maxWidth: 120,
  },
  iconContainer: {
    alignItems: 'center',
    position: 'relative', // Allow badge positioning
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'red',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CategoryGrid;

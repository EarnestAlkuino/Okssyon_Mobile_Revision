import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import CattleIcon from '../../assets/Cattle1.svg';
import HorseIcon from '../../assets/Horse1.svg';
import SheepIcon from '../../assets/Sheep1.svg';
import CarabaoIcon from '../../assets/Carabao1.svg';
import GoatIcon from '../../assets/Goat1.svg';
import PigIcon from '../../assets/Pig1.svg';

const categories = [
  { id: '1', title: 'Cattle', Icon: CattleIcon },
  { id: '2', title: 'Horse', Icon: HorseIcon },
  { id: '3', title: 'Sheep', Icon: SheepIcon },
  { id: '4', title: 'Carabao', Icon: CarabaoIcon },
  { id: '5', title: 'Goat', Icon: GoatIcon },
  { id: '6', title: 'Pig', Icon: PigIcon },
];

const CategoryGrid = ({ navigation, userId }) => (
  <FlatList
    data={categories}
    renderItem={({ item }) => (
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => navigation.navigate('AuctionPage', { category: item.title, userId })}
      >
        <View style={styles.iconContainer}>
          <item.Icon width={88} height={90} fill="#ffffff" />
        </View>
      </TouchableOpacity>
    )}
    keyExtractor={(item) => item.id}
    numColumns={3}
    columnWrapperStyle={styles.columnWrapper}
    contentContainerStyle={styles.grid}
  />
);

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
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
});

export default CategoryGrid;

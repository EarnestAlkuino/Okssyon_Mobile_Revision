import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const AnnouncementBanner = ({ announcements, flatListRef, currentIndex }) => (
  <LinearGradient
    colors={['rgba(185, 211, 112, 0.8)', 'rgba(113, 186, 144, 0.8)']}
    style={styles.banner}
  >
    <FlatList
      ref={flatListRef}
      data={announcements}
      renderItem={({ item }) => (
        <View style={styles.announcementItem}>
          <Text style={styles.announcementText}>{item.text}</Text>
          <Text style={styles.announcementDate}>{item.date}</Text>
        </View>
      )}
      keyExtractor={(item, index) => index.toString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      pagingEnabled
    />
  </LinearGradient>
);

const styles = StyleSheet.create({
  banner: {
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 38,
    paddingHorizontal: 15,
    alignItems: 'center',
    backgroundColor: '#e5f2e1',
  },
  announcementItem: {
    marginHorizontal: 15,
    alignItems: 'center',
    width: 250,
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
});

export default AnnouncementBanner;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../supabase';
import AuctionHeader from '../Components/MyAuctions/AuctionHeader';
import Tabs from '../Components/MyAuctions/Tabs';

const MyAuctionsPage = ({ navigation }) => {
  const [currentTab, setCurrentTab] = useState('AVAILABLE');
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyAuctions = async (status) => {
    setLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        Alert.alert('Error', 'Failed to fetch user information. Please log in again.');
        navigation.navigate('LoginPage');
        return;
      }

      const { data, error } = await supabase
        .from('livestock')
        .select('*')
        .eq('owner_id', user.id)
        .eq('status', status);

      if (error) {
        Alert.alert('Error', `Failed to fetch auctions: ${error.message}`);
      } else {
        setAuctions(data);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', `An unexpected error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAuctions(currentTab);
  }, [currentTab]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      disabled={item.status !== 'AVAILABLE'} // Disable if status is not 'AVAILABLE'
      onPress={() => {
        if (item.status === 'AVAILABLE') {
          navigation.navigate('LivestockAuctionDetailPage', { itemId: item.livestock_id });
        }
      }}
    >
      <Image
        source={{ uri: item.image_url || 'https://via.placeholder.com/100' }}
        style={styles.image}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.breedText}>Breed: {item.breed || 'Unknown Breed'}</Text>
        <View style={styles.detailsRow}>
          <Icon name="map-marker-outline" size={16} color="#4A5568" />
          <Text style={styles.detailValue}>Location: {item.location || 'Not specified'}</Text>
        </View>
        <View style={styles.detailsRow}>
          <Icon name="scale-bathroom" size={16} color="#4A5568" />
          <Text style={styles.detailValue}>Weight: {item.weight} kg</Text>
        </View>
        <View style={styles.detailsRow}>
          <Icon name="gender-male-female" size={16} color="#4A5568" />
          <Text style={styles.detailValue}>Gender: {item.gender}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Starting Price:</Text>
          <Text style={styles.priceText}>₱{item.starting_price?.toLocaleString()}</Text>
        </View>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, styles[item.status.toLowerCase()]]}>
            {item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2C3E50" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AuctionHeader title="My Auctions" />
      <Tabs
        tabs={['AVAILABLE', 'PENDING', 'ENDED', 'DISAPPROVED', 'SOLD']}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />
      {auctions.length > 0 ? (
        <FlatList
          data={auctions}
          renderItem={renderItem}
          keyExtractor={(item) => item.livestock_id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No auctions found under this status.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Ensures the content avoids overlapping with the bottom navigation bar
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'top',
    opacity: 1,
  },
  image: {
    width: 120,
    height: 130,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#e0e0e0',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  breedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    marginLeft: 4,
    color: '#4A5568',
  },
  priceContainer: {
    marginTop: 10,
  },
  priceLabel: {
    fontSize: 12,
    color: '#6C6C6C',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E7848',
  },
  statusContainer: {
    marginTop: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-end',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  available: {
    color: '#1E7848',
  },
  pending: {
    color: '#FFC107',
  },
  ended: {
    color: '#6C757D',
  },
  disapproved: {
    color: '#DC3545',
  },
  sold: {
    color: '#17A2B8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6C6C6C',
  },
});

export default MyAuctionsPage;

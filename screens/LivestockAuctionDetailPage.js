import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { supabase } from '../supabase';

const LivestockAuctionDetailPage = ({ route, navigation }) => {
  const { itemId, userId: userIdFromParams } = route.params || {};
  const [userId, setUserId] = useState(userIdFromParams);
  const [item, setItem] = useState(null);
  const [latestBid, setLatestBid] = useState(null); // New state for latest bid
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);

  // Fetch User ID if not provided
  useEffect(() => {
    const fetchUserIdIfNeeded = async () => {
      if (!userId) {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          Alert.alert('Error', 'Failed to retrieve user. Please log in again.');
          navigation.navigate('LoginPage');
        } else if (user) {
          setUserId(user.id);
        }
      }
    };
    fetchUserIdIfNeeded();
  }, [userId]);

  // Fetch item details and latest bid
  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      console.log("Fetching item details for itemId:", itemId); // Debugging log

      const { data, error } = await supabase
        .from('livestock')
        .select(`*, profiles:profiles!livestock_owner_id_fkey (full_name)`)
        .eq('livestock_id', itemId)
        .single();

      if (error) {
        console.error("Error fetching item details:", error); // Debugging error log
        Alert.alert("Error", "Failed to fetch item details.");
      } else {
        console.log("Fetched item details:", data); // Debugging success log
        setItem(data);
        fetchLatestBid(itemId); // Fetch the latest bid after item details are fetched
      }
      setLoading(false);
    };
    
    // Fetch the latest bid for the livestock item
    const fetchLatestBid = async (livestockId) => {
      const { data, error } = await supabase
        .from('bids')
        .select('bid_amount')
        .eq('livestock_id', livestockId)
        .order('bid_amount', { ascending: false }) // Order by highest bid amount
        .limit(1);

      if (error) {
        console.error("Error fetching latest bid:", error);
      } else if (data.length > 0) {
        setLatestBid(data[0].bid_amount);
      } else {
        setLatestBid(null); // No bids found, set to null
      }
    };

    fetchItem();
  }, [itemId]);

  // Determine if the current user is the auction creator
  const isCreator = item && userId === item.owner_id;

  // Handle button actions for creator and bidder
  const handleAction = (actionType) => {
    if (isCreator) {
      if (actionType === 'Delete') {
        Alert.alert(
          "Confirm Deletion",
          "Are you sure you want to delete this auction?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: deleteAuction },
          ]
        );
      } else if (actionType === 'Edit') {
        navigation.navigate('EditAuctionPage', { itemId });
      }
    } else {
      const targetPage = actionType === 'Bid' ? 'BidPage' : 'ChatPage';
      navigation.navigate(targetPage, { item, userId, ownerId: item.owner_id });
    }
  };

  // Delete auction function
  const deleteAuction = async () => {
    const { error } = await supabase
      .from('livestock')
      .delete()
      .eq('livestock_id', itemId);

    if (error) {
      Alert.alert("Error", "Failed to delete auction. Please try again.");
    } else {
      Alert.alert("Success", "Auction deleted successfully.");
      navigation.goBack();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#405e40" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.container}>
        <Text>No item details available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Dynamic Image Section with Loading Indicator */}
      <View style={styles.imageContainer}>
        {imageLoading && (
          <ActivityIndicator size="large" color="#405e40" style={styles.imageLoader} />
        )}
        <Image
          style={styles.mainImage}
          source={{ uri: item.image_url || 'https://via.placeholder.com/300' }}
          onLoadEnd={() => setImageLoading(false)}
        />
      </View>

      {/* Content Section with Info Container */}
      <View style={styles.contentContainer}>
        <View style={styles.infoContainer}>
          <Text style={styles.header}>{item.category.toUpperCase()}</Text>
          <Text style={styles.subHeader}>Weight: {item.weight}kg   Breed: {item.breed}</Text>
        </View>

        {/* Seller Details Section */}
        <View style={styles.sellerContainer}>
          <Image style={styles.avatar} source={{ uri: 'https://via.placeholder.com/50' }} />
          <View style={styles.sellerInfo}>
            <Text style={styles.label}>Seller: <Text style={styles.infoText}>{item.profiles?.full_name || 'Unknown'}</Text></Text>
            <Text style={styles.label}>Location: <Text style={styles.infoText}>{item.location}</Text></Text>
          </View>
        </View>

        {/* Price and Bid Section */}
        <View style={styles.priceContainer}>
          <Text style={styles.label}>Starting Price</Text>
          <Text style={styles.priceText}>₱{item.starting_price?.toLocaleString()}</Text>
          
          <Text style={styles.label}>Latest Bid</Text>
          <Text style={styles.priceText}>₱{latestBid?.toLocaleString() || 'No bids yet'}</Text>
          
          <Text style={styles.timeRemaining}>Time Remaining: {item.time_remaining || 'Not available'}</Text>
        </View>

        {/* Unified Button Container */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => handleAction(isCreator ? "Delete" : "Chat")}>
            <Text style={styles.buttonText}>{isCreator ? "Delete" : "Chat"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleAction(isCreator ? "Edit" : "Bid")}>
            <Text style={styles.buttonText}>{isCreator ? "Edit" : "Bid"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageLoader: {
    position: 'absolute',
    zIndex: 1,
  },
  contentContainer: { flex: 1, paddingHorizontal: 20 },
  infoContainer: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 20,
  },
  header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subHeader: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 20 },
  sellerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  sellerInfo: { flex: 1 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  infoText: { fontWeight: 'normal', color: '#555' },
  priceContainer: { marginBottom: 20 },
  priceText: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#333', marginVertical: 5 },
  timeRemaining: { textAlign: 'center', color: '#777' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  button: {
    backgroundColor: '#335441',
    padding: 10,
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LivestockAuctionDetailPage;

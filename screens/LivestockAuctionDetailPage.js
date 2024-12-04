import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { supabase } from '../supabase';

const LivestockAuctionDetailPage = ({ route, navigation }) => {
  const { itemId, userId: userIdFromParams } = route.params || {};
  const [userId, setUserId] = useState(userIdFromParams);
  const [item, setItem] = useState(null);
  const [latestBid, setLatestBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);

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

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('livestock')
        .select(`*, profiles:profiles!livestock_owner_id_fkey (full_name)`)
        .eq('livestock_id', itemId)
        .single();

      if (error) {
        Alert.alert("Error", "Failed to fetch item details.");
      } else {
        setItem(data);
        fetchLatestBid(itemId);
        if (data.end_time) {
          startCountdown(data.end_time);
        }
      }
      setLoading(false);
    };

    const fetchLatestBid = async (livestockId) => {
      const { data, error } = await supabase
        .from('bids')
        .select('bid_amount')
        .eq('livestock_id', livestockId)
        .order('bid_amount', { ascending: false })
        .limit(1);

      if (!error && data.length > 0) {
        setLatestBid(data[0].bid_amount);
      } else {
        setLatestBid(null);
      }
    };

    fetchItem();

    const bidSubscription = supabase
      .channel('bid_updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bids', filter: `livestock_id=eq.${itemId}` }, (payload) => {
        setLatestBid((prevBid) => Math.max(prevBid || 0, payload.new.bid_amount));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bidSubscription);
    };
  }, [itemId]);

  const startCountdown = (endTime) => {
    const endTimestamp = new Date(endTime).getTime();

    const timer = setInterval(() => {
      const currentTime = new Date().getTime();
      const remainingTime = endTimestamp - currentTime;

      if (remainingTime <= 0) {
        clearInterval(timer);
        setTimeRemaining('Auction Ended');
      } else {
        const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
        setTimeRemaining(
          `${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s`
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  };

  const isCreator = item && userId === item.owner_id;

  const handleAction = async (actionType) => {
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
    } else if (timeRemaining !== "Auction Ended") {
      if (actionType === 'Bid') {
        navigation.navigate('BidPage', { item, userId, ownerId: item.owner_id });
      } else if (actionType === 'Ask') {
        navigation.navigate('ForumPage', { item, userId });
      }
    } else {
      Alert.alert("Auction Ended", "This auction has ended. Bidding is no longer allowed.");
    }
  };

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

      <View style={styles.contentContainer}>
        <View style={styles.infoContainer}>
          <Text style={styles.header}>{item.category.toUpperCase()}</Text>
          <Text style={styles.subHeader}>Weight: {item.weight}kg   Breed: {item.breed}</Text>
        </View>

        <View style={styles.sellerContainer}>
          <Image style={styles.avatar} source={{ uri: 'https://via.placeholder.com/50' }} />
          <View style={styles.sellerInfo}>
            <Text style={styles.label}>Seller: <Text style={styles.infoText}>{item.profiles?.full_name || 'Unknown'}</Text></Text>
            <Text style={styles.label}>Location: <Text style={styles.infoText}>{item.location}</Text></Text>
          </View>
        </View>

        <View style={styles.priceSection}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Starting Price</Text>
            <Text style={styles.priceText}>₱{item.starting_price?.toLocaleString()}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Latest Bid</Text>
            <Text style={styles.priceText}>₱{latestBid?.toLocaleString() || 'No bids yet'}</Text>
          </View>
        </View>

        <Text style={styles.timeRemaining}>Time Remaining: {timeRemaining || 'Loading...'}</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => handleAction(isCreator ? "Delete" : "Ask")}>
            <Text style={styles.buttonText}>{isCreator ? "Delete" : "Ask"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, timeRemaining === "Auction Ended" ? styles.disabledButton : null]} onPress={() => handleAction(isCreator ? "Edit" : "Bid")} disabled={timeRemaining === "Auction Ended"}>
            <Text style={styles.buttonText}>{isCreator ? "Edit" : "Bid"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  imageContainer: { width: '100%', height: 200, position: 'relative', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  mainImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageLoader: { position: 'absolute', zIndex: 1 },
  contentContainer: { flex: 1, paddingHorizontal: 20 },
  infoContainer: { padding: 20, backgroundColor: '#f8f8f8', borderRadius: 8, marginBottom: 20 },
  header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subHeader: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 20 },
  sellerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  sellerInfo: { flex: 1 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  infoText: { fontWeight: 'normal', color: '#555' },
  priceSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  priceContainer: { flex: 1, alignItems: 'center', padding: 15, backgroundColor: '#f2f2f2', borderRadius: 8, marginHorizontal: 5 },
  priceLabel: { fontSize: 16, color: '#555' },
  priceText: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 5 },
  timeRemaining: { textAlign: 'center', color: '#777', marginVertical: 10, fontSize: 16 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  button: { backgroundColor: '#335441', padding: 10, borderRadius: 5, width: '40%', alignItems: 'center' },
  disabledButton: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default LivestockAuctionDetailPage;